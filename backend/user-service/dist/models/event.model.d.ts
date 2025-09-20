import mongoose, { Document } from "mongoose";
export interface IEvent extends Document {
    name: string;
    description: string;
    date: Date;
    venue: {
        name: string;
        address: string;
        capacity: number;
    };
    totalCapacity: number;
    availableSeats: number;
    basePrice: number;
    status: "draft" | "published" | "sold_out" | "cancelled";
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IEvent, {}, {}, {}, mongoose.Document<unknown, {}, IEvent, {}, {}> & IEvent & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=event.model.d.ts.map