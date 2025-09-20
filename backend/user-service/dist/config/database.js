"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI ||
            "mongodb://admin:admin123@localhost:27017/ticketing?authSource=admin";
        await mongoose_1.default.connect(mongoUri);
        mongoose_1.default.connection.on("error", (error) => {
            console.error("MongoDB connection error:", error);
        });
        mongoose_1.default.connection.on("disconnected", () => {
            console.warn("MongoDB disconnected");
        });
    }
    catch (error) {
        throw error;
    }
};
exports.connectDB = connectDB;
//# sourceMappingURL=database.js.map