import { Request, Response } from "express";
import User from "../models/user.model";
import Message from "../models/message.mode";
import cloudinary from "../lib/cloudinary";
import {getSocketIdOfReceiver, io} from "../lib/socket";

export const getUsersForSidebar = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const loggedInUserId = req.user._id;

    const users = await User.find({ _id: { $ne: loggedInUserId } }).select(
      "-password"
    );

    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { id: otherPersonId } = req.params;
    //@ts-ignore
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: otherPersonId },
        { senderId: otherPersonId, receiverId: myId },
      ],
    });
    res.status(200).json(messages);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
    try{
        const {text, image} = req.body;
        const { id : receiverId } = req.params;
        //@ts-ignore
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            const uploadedImage = await cloudinary.uploader.upload(image);
            imageUrl = uploadedImage.secure_url;
        }

        const message = new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl
        })
        await message.save();
        
        const receiver = getSocketIdOfReceiver(message.receiverId.toString());
        if(receiver) io.to(receiver).emit("newMessage",message);

        res.status(201).json(message);
    }catch(err){
        console.log("error in send message controller",err);
        res.status(500).json({message: "Internal server error"});
    }
}