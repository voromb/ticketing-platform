"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageSchema = exports.Message = exports.MessageMetadata = exports.ResourceType = exports.ActionType = exports.MessageType = exports.SenderType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var SenderType;
(function (SenderType) {
    SenderType["USER"] = "USER";
    SenderType["COMPANY_ADMIN"] = "COMPANY_ADMIN";
    SenderType["SUPER_ADMIN"] = "SUPER_ADMIN";
    SenderType["SYSTEM"] = "SYSTEM";
})(SenderType || (exports.SenderType = SenderType = {}));
var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "TEXT";
    MessageType["NOTIFICATION"] = "NOTIFICATION";
    MessageType["SYSTEM_ALERT"] = "SYSTEM_ALERT";
})(MessageType || (exports.MessageType = MessageType = {}));
var ActionType;
(function (ActionType) {
    ActionType["PURCHASE"] = "PURCHASE";
    ActionType["APPROVAL"] = "APPROVAL";
    ActionType["REJECTION"] = "REJECTION";
    ActionType["INFO"] = "INFO";
})(ActionType || (exports.ActionType = ActionType = {}));
var ResourceType;
(function (ResourceType) {
    ResourceType["RESTAURANT"] = "RESTAURANT";
    ResourceType["TRAVEL"] = "TRAVEL";
    ResourceType["PRODUCT"] = "PRODUCT";
})(ResourceType || (exports.ResourceType = ResourceType = {}));
let MessageMetadata = class MessageMetadata {
    orderId;
    approvalId;
    resourceType;
    resourceId;
    actionType;
};
exports.MessageMetadata = MessageMetadata;
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], MessageMetadata.prototype, "orderId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], MessageMetadata.prototype, "approvalId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ResourceType }),
    __metadata("design:type", String)
], MessageMetadata.prototype, "resourceType", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], MessageMetadata.prototype, "resourceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ActionType }),
    __metadata("design:type", String)
], MessageMetadata.prototype, "actionType", void 0);
exports.MessageMetadata = MessageMetadata = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], MessageMetadata);
let Message = class Message {
    conversationId;
    senderId;
    senderType;
    senderName;
    content;
    messageType;
    metadata;
    isRead;
    readAt;
};
exports.Message = Message;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Conversation', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Message.prototype, "conversationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Message.prototype, "senderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: SenderType, required: true }),
    __metadata("design:type", String)
], Message.prototype, "senderType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Message.prototype, "senderName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Message.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: MessageType, default: MessageType.TEXT }),
    __metadata("design:type", String)
], Message.prototype, "messageType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: MessageMetadata }),
    __metadata("design:type", MessageMetadata)
], Message.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Message.prototype, "isRead", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Message.prototype, "readAt", void 0);
exports.Message = Message = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Message);
exports.MessageSchema = mongoose_1.SchemaFactory.createForClass(Message);
exports.MessageSchema.index({ conversationId: 1, createdAt: -1 });
exports.MessageSchema.index({ senderId: 1 });
exports.MessageSchema.index({ isRead: 1 });
//# sourceMappingURL=message.schema.js.map