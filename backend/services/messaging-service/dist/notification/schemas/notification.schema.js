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
exports.NotificationSchema = exports.Notification = exports.NotificationMetadata = exports.UserType = exports.NotificationCategory = exports.NotificationType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var NotificationType;
(function (NotificationType) {
    NotificationType["SUCCESS"] = "SUCCESS";
    NotificationType["INFO"] = "INFO";
    NotificationType["WARNING"] = "WARNING";
    NotificationType["ERROR"] = "ERROR";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var NotificationCategory;
(function (NotificationCategory) {
    NotificationCategory["PURCHASE"] = "PURCHASE";
    NotificationCategory["APPROVAL"] = "APPROVAL";
    NotificationCategory["SYSTEM"] = "SYSTEM";
    NotificationCategory["GENERAL"] = "GENERAL";
})(NotificationCategory || (exports.NotificationCategory = NotificationCategory = {}));
var UserType;
(function (UserType) {
    UserType["USER"] = "USER";
    UserType["COMPANY_ADMIN"] = "COMPANY_ADMIN";
    UserType["SUPER_ADMIN"] = "SUPER_ADMIN";
})(UserType || (exports.UserType = UserType = {}));
let NotificationMetadata = class NotificationMetadata {
    orderId;
    approvalId;
    resourceType;
    resourceId;
    actionUrl;
};
exports.NotificationMetadata = NotificationMetadata;
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], NotificationMetadata.prototype, "orderId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], NotificationMetadata.prototype, "approvalId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], NotificationMetadata.prototype, "resourceType", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], NotificationMetadata.prototype, "resourceId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], NotificationMetadata.prototype, "actionUrl", void 0);
exports.NotificationMetadata = NotificationMetadata = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], NotificationMetadata);
let Notification = class Notification {
    userId;
    userType;
    title;
    message;
    notificationType;
    category;
    metadata;
    isRead;
    readAt;
    expiresAt;
};
exports.Notification = Notification;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Notification.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: UserType, required: true }),
    __metadata("design:type", String)
], Notification.prototype, "userType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Notification.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Notification.prototype, "message", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: NotificationType, required: true }),
    __metadata("design:type", String)
], Notification.prototype, "notificationType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: NotificationCategory, required: true }),
    __metadata("design:type", String)
], Notification.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: NotificationMetadata }),
    __metadata("design:type", NotificationMetadata)
], Notification.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Notification.prototype, "isRead", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Notification.prototype, "readAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Notification.prototype, "expiresAt", void 0);
exports.Notification = Notification = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Notification);
exports.NotificationSchema = mongoose_1.SchemaFactory.createForClass(Notification);
exports.NotificationSchema.index({ userId: 1, createdAt: -1 });
exports.NotificationSchema.index({ isRead: 1 });
exports.NotificationSchema.index({ category: 1 });
exports.NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
//# sourceMappingURL=notification.schema.js.map