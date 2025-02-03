import { NextFunction, Request, Response } from "express";
import jwt  from 'jsonwebtoken';
import User from "../models/user.model";

export const protectRoute = async( req:Request, res:Response, next: NextFunction) => {
    try{
        //@ts-ignore
        const token = req.cookies.jwt;
        if(!token){
            res.status(401).json({message: "Unauthorized access"});
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET ?? '');
        if(!decoded){
            res.status(401).json({message: "Unauthorized access"});
            return;
        }
        //@ts-ignore
        const user = await User.findById(decoded.userId);
        if(!user){
            res.status(401).json({message: "Unauthorized access"});
            return;
        }
        //@ts-ignore
        req.user = user;

        next(); 
    }catch(err){
        console.log("error in protected route",err);
        res.status(500).json({message: "Internal server error"});
    }
}
