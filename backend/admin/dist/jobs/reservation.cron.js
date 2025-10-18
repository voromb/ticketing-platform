"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startReservationCron = startReservationCron;
const cron = __importStar(require("node-cron"));
const reservation_controller_1 = __importDefault(require("../controllers/reservation.controller"));
const logger_1 = require("../utils/logger");
/**
 * Cron job que se ejecuta cada minuto para expirar reservas
 * Libera automáticamente las reservas VIP que han pasado los 15 minutos
 */
function startReservationCron() {
    // Ejecutar cada minuto: '* * * * *'
    cron.schedule('* * * * *', async () => {
        try {
            const result = await reservation_controller_1.default.expireReservations();
            if (result.expired > 0) {
                logger_1.logger.info(`[CRON] ${result.expired} reservas expiradas y liberadas`);
            }
        }
        catch (error) {
            logger_1.logger.error('Error en cron de reservas:', error);
        }
    });
    logger_1.logger.info('[CRON] Cron job de reservas iniciado (cada 1 minuto)');
}
