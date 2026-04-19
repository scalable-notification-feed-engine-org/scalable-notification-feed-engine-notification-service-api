import {Request, Response} from "express";
import Notification from "../models/Notification";

export const getNotifications = async (request:Request, response:Response) => {
    try {
        const userId = (request as any).user!.sub;

       const notifications = await Notification.find({recipientId: userId })
           .sort({ createdAt : -1 })
           .limit(50);
       response.status(200).json(notifications || []);
       console.log(notifications);

    }catch(err){
        // @ts-ignore
        console.error(" Controller Error:", err.message);
        response.status(500).json({message: "Error while getting notification" , err});
    }
}

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.sub;

        const updatedNotification = await Notification.updateOne(
            { _id: id, recipientId: userId },
            { $set: { isRead: true } }
        );

        if (!updatedNotification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({ success: true, message: "Marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Error updating notification", error });
    }
};

export const markAsAll = async (req: Request, res: Response) => {
    try{

        const userId = (req as any).user.sub;

        await Notification.updateMany(
            { recipientId: userId , isRead: false },
            { $set: { isRead: true } }
        );
        return res.status(200).json({ success: true, message: "All notifications cleared" });
    } catch (error: any) {
        return res.status(500).json({ message: "Bulk update failed" });
    }
}