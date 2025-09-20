export interface ITicket {
  id: string;
  eventId: string;
  userId: string;
  seats: string[];
  price: number;
  discountCode?: string;
  finalPrice: number;
  status: TicketStatus;
  qrCode?: string;
  purchasedAt?: Date;
  reservedAt: Date;
  expiresAt?: Date;
}

export enum TicketStatus {
  RESERVED = 'reserved',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  USED = 'used'
}
