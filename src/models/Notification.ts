import mongoose,{Schema} from 'mongoose';

export interface INotification extends Document {
    recipientId: string;
    actorId: string;
    type: string;
    message: string;
    targetId?: string;
    isRead: boolean;
    createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
   recipientId: {type: String, required: true,index: true},
   actorId: {type: String, required: true},
   type: {type: String, required: true},
   message: {type: String, required: true},
   targetId: {type: String},
   isRead: {type: Boolean, default: false},
   createdAt: {type: Date, default: Date.now},
})

export default mongoose.model<INotification>('Notification',NotificationSchema);