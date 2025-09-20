import mongoose, { Document } from "mongoose";
export interface ITicket extends Document {
    eventId: mongoose.Types.ObjectId;
    userId: string;
    seats: string[];
    price: number;
    finalPrice: number;
    status: "reserved" | "paid" | "cancelled" | "expired" | "used";
    qrCode?: string;
    purchasedAt?: Date;
    reservedAt: Date;
    expiresAt: Date;
}
declare const _default: mongoose.Model<ITicket, {}, {}, {}, mongoose.Document<unknown, {}, ITicket, {}, {}> & ITicket & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=ticket.model.d.ts.map