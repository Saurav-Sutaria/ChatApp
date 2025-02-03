import { createContext, ReactNode, useContext, useState } from "react";
import { User } from "../model/User.model";
import { axiosInstance } from "../lib/axios";
import { SignupModel } from "../model/Signup.model";
import toast from "react-hot-toast";
import { LoginModel } from "../model/Login.mode";
import { io, Socket } from "socket.io-client";

interface IAuthContext {
  user: User | null;
  isCheckingAuth: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  checkAuth: () => Promise<void>;
  isSigningUp: boolean;
  signup: (data: SignupModel) => Promise<void>;
  logout: () => Promise<void>;
  login: (data: LoginModel) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  onlineUsers: string[];
  socket : Socket | null;
}

const BACKEND_BASE_URL: string = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

const initialContextValue: IAuthContext = {
  user: null,
  isCheckingAuth: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  checkAuth: async () => {},
  isSigningUp: false,
  signup: async () => {},
  logout: async () => {},
  login: async () => {},
  updateProfile: async () => {},
  onlineUsers: [],
  socket: null,
};

const AuthenticationContext = createContext<IAuthContext>(initialContextValue);

export const useAuthentication = () => {
  return useContext(AuthenticationContext);
};

export const AuthenticationContextProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isSigningUp, setIsSigningUp] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState<boolean>(false);

  const signup = async (data: SignupModel) => {
    try {
      setIsSigningUp(true);

      const res = await axiosInstance.post("/auth/signup", data);
      console.log(res);
      setUser({ ...res.data });
      toast.success("Signup successful");
      connectSocket(res.data);
    } catch (err: any) {
      toast.error(err.response.data.message);
    } finally {
      setIsSigningUp(false);
    }
  };

  const connectSocket = (user: User) => {
    if (!user || socket?.connected) return;
    const newSocket = io(BACKEND_BASE_URL, {
      query: {
        userId: user._id,
      },
    });
    newSocket.connect();

    newSocket.on("getOnlineUsers", (data: string[]) => {
      console.log('online users data from backend',data);
      setOnlineUsers(data);
    })

    setSocket(newSocket);
  };

  const disconnectSocket = () => {
    if (socket?.connected) {
      socket.disconnect();
      setSocket(null);
    }
  };

  const login = async (data: LoginModel) => {
    try {
      setIsLoggingIn(true);
      const res = await axiosInstance.post("/auth/login", data);
      setUser({ ...res.data });
      toast.success("Login successful");
      connectSocket(res.data);
    } catch (err: any) {
      toast.error(err.response.data.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
      setUser(null);
      toast.success("Logout successful");
      disconnectSocket();
    } catch (err: any) {
      toast.error(err.response.data.message);
    }
  };

  const checkAuth = async () => {
    try {
      setIsCheckingAuth(true);
      const res = await axiosInstance.get("/auth/check");
      setUser({ ...res.data });
      connectSocket(res.data);
    } catch (err) {
      console.log("err in checkauth", err);
      setUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const updateProfile = async (data: any) => {
    try {
      setIsUpdatingProfile(true);
      const res = await axiosInstance.put("/auth/update-profile", data);
      setUser({ ...res.data });
      toast.success("Profile updated successfully");
    } catch (err: any) {
      console.log("error in update profile", err);
      toast.error(err.response.data.message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <AuthenticationContext.Provider
      value={{
        user,
        isCheckingAuth,
        checkAuth,
        signup,
        isSigningUp,
        logout,
        login,
        isLoggingIn,
        isUpdatingProfile,
        updateProfile,
        onlineUsers,
        socket
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};
