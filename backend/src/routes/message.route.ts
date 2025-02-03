import express from 'express'
import { protectRoute } from '../middlewares/auth.middleware';
import { getMessages, getUsersForSidebar, sendMessage } from '../controllers/message.controller';

const messageRouter = express.Router();

messageRouter.get('/users', protectRoute, getUsersForSidebar);
messageRouter.get('/:id', protectRoute, getMessages);
messageRouter.post('/send/:id', protectRoute, sendMessage);

export default messageRouter;