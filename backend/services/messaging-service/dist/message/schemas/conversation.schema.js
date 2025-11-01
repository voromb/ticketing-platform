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
exports.ConversationSchema = exports.Conversation = exports.Participant = exports.UserType = exports.ConversationType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var ConversationType;
(function (ConversationType) {
    ConversationType["PRIVATE"] = "PRIVATE";
    ConversationType["SUPPORT"] = "SUPPORT";
    ConversationType["SYSTEM"] = "SYSTEM";
})(ConversationType || (exports.ConversationType = ConversationType = {}));
var UserType;
(function (UserType) {
    UserType["USER"] = "USER";
    UserType["COMPANY_ADMIN"] = "COMPANY_ADMIN";
    UserType["SUPER_ADMIN"] = "SUPER_ADMIN";
})(UserType || (exports.UserType = UserType = {}));
let Participant = class Participant {
    userId;
    userType;
    userName;
    lastReadAt;
};
exports.Participant = Participant;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Participant.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: UserType, required: true }),
    __metadata("design:type", String)
], Participant.prototype, "userType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Participant.prototype, "userName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Participant.prototype, "lastReadAt", void 0);
exports.Participant = Participant = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], Participant);
let Conversation = class Conversation {
    participants;
    conversationType;
    subject;
    lastMessageAt;
    lastMessagePreview;
    unreadCount;
    isActive;
};
exports.Conversation = Conversation;
__decorate([
    (0, mongoose_1.Prop)({ type: [Participant], required: true }),
    __metadata("design:type", Array)
], Conversation.prototype, "participants", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ConversationType, default: ConversationType.PRIVATE }),
    __metadata("design:type", String)
], Conversation.prototype, "conversationType", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Conversation.prototype, "subject", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Conversation.prototype, "lastMessageAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Conversation.prototype, "lastMessagePreview", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Map, of: Number, default: {} }),
    __metadata("design:type", Map)
], Conversation.prototype, "unreadCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Conversation.prototype, "isActive", void 0);
exports.Conversation = Conversation = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Conversation);
exports.ConversationSchema = mongoose_1.SchemaFactory.createForClass(Conversation);
exports.ConversationSchema.index({ 'participants.userId': 1 });
exports.ConversationSchema.index({ lastMessageAt: -1 });
exports.ConversationSchema.index({ isActive: 1 });
//# sourceMappingURL=conversation.schema.js.map