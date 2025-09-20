"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQRCode = void 0;
const generateQRCode = async (ticketId) => {
    // Por ahora retornamos un placeholder
    // Después integraremos una librería real de QR
    return `QR_${ticketId}_${Date.now()}`;
};
exports.generateQRCode = generateQRCode;
//# sourceMappingURL=qr.util.js.map