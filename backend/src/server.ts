import express from 'express'
import authRouter from './routes/auth.route';
import {config} from 'dotenv'
import { connectDB } from './lib/db';
import cookieParser from 'cookie-parser'
import messageRouter from './routes/message.route';
import {app, server} from './lib/socket'
import cors from 'cors'
import path from 'path'

const _dirname = path.resolve();

app.use(express.json())
config()
app.use(cookieParser()) 
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

app.use('/api/auth',authRouter)
app.use('/api/messages',messageRouter)

if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(_dirname,"../frontend/dist")))

    app.get('*',(req,res) => {
        res.sendFile(path.join(_dirname,'../frontend/','dist', 'index.html'))
    })
}

const PORT = process.env.PORT || 3000;
server.listen(PORT,()=>{
    console.log(`app listening on port ${PORT}`);
    connectDB();
})