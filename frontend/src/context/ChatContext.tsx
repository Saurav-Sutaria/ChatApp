import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { User } from "../model/User.model";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { Message } from "../model/Message.model";
import { Socket } from "socket.io-client";

interface IChatContext {
  getUsers: () => Promise<void>;
  selectedUser: User | null;
  users: User[];
  setSelectedUser: (user: User | null) => void;
  isUserLoading: boolean;
  getMessages: (userId: string) => void;
  isMessagesLoading: boolean;
  messages: Message[];
  sendMessage: (text: string | null, image: string | null) => Promise<void>;
  subscribeToMessage: (user : User, socket :Socket) => void;
  unsubscribeToMessage: (socket : Socket) => void;
}

const initialValue: IChatContext = {
  getUsers: async () => {},
  selectedUser: null,
  users: [],
  setSelectedUser: () => {},
  isUserLoading: false,
  getMessages: async () => {},
  isMessagesLoading: false,
  messages: [],
  sendMessage: async () => {},
  subscribeToMessage: () => {},
  unsubscribeToMessage: () => {},
};

const ChatContext = createContext<IChatContext>(initialValue);

export const useChat = () => {
  return useContext(ChatContext);
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isUserLoading, setIsUserLoading] = useState<boolean>(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState<boolean>(false);

  const getUsers = useCallback(async (): Promise<void> => {
    try {
      setIsUserLoading(true);
      const res = await axiosInstance.get("/messages/users");
      setUsers(res.data);
    } catch (err: any) {
      console.log("error in get users", err);
      toast.error(err.response.data.message);
    } finally {
      setIsUserLoading(false);
    }
  }, []);

  const getMessages = useCallback(async (userId: string) => {
    try {
      setIsMessagesLoading(true);
      const res = await axiosInstance.get(`/messages/${userId}`);
      setMessages(res.data);
    } catch (err: any) {
      console.log("error in get messages", err);
      toast.error(err.response.data.message);
    } finally {
      setIsMessagesLoading(false);
    }
  }, []);

  const sendMessage = async (
    text: string | null,
    image: string | null
  ): Promise<void> => {
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser?._id}`,
        {
          text,
          image,
        }
      );
      setMessages([...messages, res.data]);
    } catch (err) {
      console.log("error in send message", err);
      toast.error("error in sending message");
    }
  };

  const subscribeToMessage = (user : User, socket : Socket) => {
    if (!socket || !user) return;

    socket.on("newMessage", (message: Message) => {
        if(message.senderId !== user._id) return;
        console.log('old messages',messages);
        console.log('new message',message); 
      setMessages((prev) => [...prev, message]);
    });
  };

  const unsubscribeToMessage = (socket : Socket) => {
    if (socket) {
      socket.off("newMessage");
    }
  };

  return (
    <ChatContext.Provider
      value={{
        getUsers,
        users,
        messages,
        setSelectedUser,
        isMessagesLoading,
        selectedUser,
        isUserLoading,
        getMessages,
        sendMessage,
        subscribeToMessage,
        unsubscribeToMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
