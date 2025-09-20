export const generateQRCode = async (ticketId: string): Promise<string> => {
  // Por ahora retornamos un placeholder
  // Después integraremos una librería real de QR
  return `QR_${ticketId}_${Date.now()}`;
};
