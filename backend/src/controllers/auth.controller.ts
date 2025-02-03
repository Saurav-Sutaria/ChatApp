import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/user.model";
import { generateToken } from "../lib/utils";
import cloudinary from "../lib/cloudinary";
export const signup = async (req: Request, res: Response) => {
  try {
    const { email, fullName, password } = req.body;

    if (!email || !fullName || !password) {
      res.status(400).json({ message: "All fields are requried" });
    }

    if (password.length < 6) {
      res
        .status(400)
        .json({ message: "Password must be atleast 6 characters long" });
        return;
    }

    const user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      //@ts-ignore
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
        createdAt : newUser.createdAt
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (err) {
    console.log("error in signup controller",err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }
    const isPasswordCorrect = await bcrypt.compare(password,user.password);

    if(!isPasswordCorrect){
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    //@ts-ignore
    generateToken(user._id,res);
    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      createdAt : user.createdAt
    });
  } catch (err) {
    console.log("error in login controller",err);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const logout = (req: Request, res: Response) => {
  try{
    res.cookie('jwt','',{maxAge : 0})
    res.status(200).json({ message: "Logged out successfully" });

  }catch(err){
    console.log("error in logout controller", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { profilePic } = req.body; 
    //@ts-ignore
    const userId = req.user._id;

    if(!profilePic){
      res.status(400).json({ message: "Profile pic is required" });
      return;
    }

    const uploadedImage = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(userId,{
      profilePic : uploadedImage.secure_url
    },{new :true});

    res.status(200).json(updatedUser);
  }
  catch (err) {
    console.log("error in update prodile controller",err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const checkAuth = (req: Request, res: Response) => {
  try{
    //@ts-ignore
    const user = req.user;
    res.status(200).json(user);
  }catch(err){
    console.log("error in checkAuth controller", err);
    res.status(500).json({ message: "Internal server error" });
  }
}