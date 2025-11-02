"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const message_controller_1 = require("./message.controller");
const message_service_1 = require("./message.service");
const approval_message_listener_1 = require("./approval-message.listener");
const message_schema_1 = require("./schemas/message.schema");
const conversation_schema_1 = require("./schemas/conversation.schema");
const rabbitmq_module_1 = require("../rabbitmq/rabbitmq.module");
let MessageModule = class MessageModule {
};
exports.MessageModule = MessageModule;
exports.MessageModule = MessageModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: message_schema_1.Message.name, schema: message_schema_1.MessageSchema },
                { name: conversation_schema_1.Conversation.name, schema: conversation_schema_1.ConversationSchema },
            ]),
            rabbitmq_module_1.RabbitMQModule,
        ],
        controllers: [message_controller_1.MessageController, approval_message_listener_1.ApprovalMessageListener],
        providers: [message_service_1.MessageService],
        exports: [message_service_1.MessageService],
    })
], MessageModule);
//# sourceMappingURL=message.module.js.map