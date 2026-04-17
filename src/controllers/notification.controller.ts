import {Request, Response} from "express";
import Notification from "../models/Notification";

export const getNotifications = async (request:Request, response:Response) => {
    try {
        const userId = (request as any).user!.sub;

       const notifications = await Notification.find({ userId: userId })
           .sort({ createdAt : -1 })
           .limit(50);

       response.status(200).json(notifications || []);

    }catch(err){
        // @ts-ignore
        console.error("🔥 Controller Error:", err.message);
        response.status(500).json({message: "Error while getting notification" , err});
    }
}

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.sub;

        const updatedNotification = await Notification.findOneAndUpdate(
            { _id: id, recipientId: userId },
            { isRead: true },
            { new: true }
        );

        if (!updatedNotification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json(updatedNotification);
    } catch (error) {
        res.status(500).json({ message: "Error updating notification", error });
    }
};