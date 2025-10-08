import * as cron from 'node-cron';
import ReservationController from '../controllers/reservation.controller';
import { logger } from '../utils/logger';

/**
 * Cron job que se ejecuta cada minuto para expirar reservas
 * Libera automáticamente las reservas VIP que han pasado los 15 minutos
 */
export function startReservationCron() {
  // Ejecutar cada minuto: '* * * * *'
  cron.schedule('* * * * *', async () => {
    try {
      const result = await ReservationController.expireReservations();

      if (result.expired > 0) {
        logger.info(`🕒 Cron: ${result.expired} reservas expiradas y liberadas`);
      }
    } catch (error: any) {
      logger.error('Error en cron de reservas:', error);
    }
  });

  logger.info('✅ Cron job de reservas iniciado (cada 1 minuto)');
}
