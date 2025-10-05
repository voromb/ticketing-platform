import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface VipBenefit {
  id: string;
  name: string;
  description: string;
  type: 'discount' | 'access' | 'service' | 'exclusive';
  value: string | number;
  isActive: boolean;
  icon: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface VipConfig {
  id?: string;
  discountPercentage: number;
  priorityAccess: boolean;
  exclusiveOffers: boolean;
  premiumSupport: boolean;
  earlyAccess: boolean;
  freeShipping: boolean;
  customBenefits: VipBenefit[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class VipController {
  // Obtener configuración VIP actual
  static getVipConfig = async (req: FastifyRequest, res: FastifyReply) => {
    try {
      logger.info('🔍 Obteniendo configuración VIP');

      // Buscar configuración VIP existente
      let vipConfig = await prisma.vipConfig.findFirst({
        include: {
          benefits: true
        }
      });

      // Si no existe, crear configuración por defecto
      if (!vipConfig) {
        vipConfig = await prisma.vipConfig.create({
          data: {
            discountPercentage: 10,
            priorityAccess: true,
            exclusiveOffers: true,
            premiumSupport: true,
            earlyAccess: false,
            freeShipping: false,
            benefits: {
              create: [
                {
                  name: 'Entrada gratuita a soundcheck',
                  description: 'Acceso exclusivo al soundcheck antes del concierto',
                  type: 'exclusive',
                  value: 'Gratis',
                  isActive: true,
                  icon: '🎵'
                },
                {
                  name: 'Meet & Greet',
                  description: 'Encuentro personal con los artistas',
                  type: 'exclusive',
                  value: 'Incluido',
                  isActive: true,
                  icon: '🤝'
                }
              ]
            }
          },
          include: {
            benefits: true
          }
        });
      }

      logger.info('✅ Configuración VIP obtenida exitosamente');
      
      res.json({
        success: true,
        data: {
          id: vipConfig.id,
          discountPercentage: vipConfig.discountPercentage,
          priorityAccess: vipConfig.priorityAccess,
          exclusiveOffers: vipConfig.exclusiveOffers,
          premiumSupport: vipConfig.premiumSupport,
          earlyAccess: vipConfig.earlyAccess,
          freeShipping: vipConfig.freeShipping,
          customBenefits: vipConfig.benefits.map(benefit => ({
            id: benefit.id,
            name: benefit.name,
            description: benefit.description,
            type: benefit.type,
            value: benefit.value,
            isActive: benefit.isActive,
            icon: benefit.icon
          }))
        }
      });

    } catch (error) {
      logger.error('❌ Error obteniendo configuración VIP:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  // Actualizar configuración VIP
  static updateVipConfig = async (req: Request, res: Response) => {
    try {
      const {
        discountPercentage,
        priorityAccess,
        exclusiveOffers,
        premiumSupport,
        earlyAccess,
        freeShipping,
        customBenefits
      } = req.body;

      logger.info('🔄 Actualizando configuración VIP');

      // Validaciones
      if (discountPercentage < 0 || discountPercentage > 50) {
        return res.status(400).json({
          success: false,
          error: 'El descuento debe estar entre 0% y 50%'
        });
      }

      // Buscar configuración existente
      let vipConfig = await prisma.vipConfig.findFirst();

      if (vipConfig) {
        // Actualizar configuración existente
        vipConfig = await prisma.vipConfig.update({
          where: { id: vipConfig.id },
          data: {
            discountPercentage,
            priorityAccess,
            exclusiveOffers,
            premiumSupport,
            earlyAccess,
            freeShipping,
            updatedAt: new Date()
          },
          include: {
            benefits: true
          }
        });
      } else {
        // Crear nueva configuración
        vipConfig = await prisma.vipConfig.create({
          data: {
            discountPercentage,
            priorityAccess,
            exclusiveOffers,
            premiumSupport,
            earlyAccess,
            freeShipping
          },
          include: {
            benefits: true
          }
        });
      }

      logger.info('✅ Configuración VIP actualizada exitosamente');

      res.json({
        success: true,
        message: 'Configuración VIP actualizada exitosamente',
        data: vipConfig
      });

    } catch (error) {
      logger.error('❌ Error actualizando configuración VIP:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  // Crear beneficio personalizado
  static createBenefit = async (req: Request, res: Response) => {
    try {
      const { name, description, type, value, isActive, icon } = req.body;

      logger.info('➕ Creando nuevo beneficio VIP:', { name, type });

      // Validaciones
      if (!name || !description || !type || !icon) {
        return res.status(400).json({
          success: false,
          error: 'Todos los campos obligatorios deben ser proporcionados'
        });
      }

      // Obtener configuración VIP
      let vipConfig = await prisma.vipConfig.findFirst();
      
      if (!vipConfig) {
        // Crear configuración por defecto si no existe
        vipConfig = await prisma.vipConfig.create({
          data: {
            discountPercentage: 10,
            priorityAccess: true,
            exclusiveOffers: true,
            premiumSupport: true,
            earlyAccess: false,
            freeShipping: false
          }
        });
      }

      // Crear beneficio
      const benefit = await prisma.vipBenefit.create({
        data: {
          name,
          description,
          type,
          value: value || '',
          isActive: isActive !== undefined ? isActive : true,
          icon,
          vipConfigId: vipConfig.id
        }
      });

      logger.info('✅ Beneficio VIP creado exitosamente:', benefit.id);

      res.status(201).json({
        success: true,
        message: 'Beneficio VIP creado exitosamente',
        data: benefit
      });

    } catch (error) {
      logger.error('❌ Error creando beneficio VIP:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  // Actualizar beneficio
  static updateBenefit = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, description, type, value, isActive, icon } = req.body;

      logger.info('🔄 Actualizando beneficio VIP:', id);

      const benefit = await prisma.vipBenefit.update({
        where: { id },
        data: {
          name,
          description,
          type,
          value,
          isActive,
          icon,
          updatedAt: new Date()
        }
      });

      logger.info('✅ Beneficio VIP actualizado exitosamente');

      res.json({
        success: true,
        message: 'Beneficio actualizado exitosamente',
        data: benefit
      });

    } catch (error) {
      logger.error('❌ Error actualizando beneficio VIP:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  // Eliminar beneficio
  static deleteBenefit = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      logger.info('🗑️ Eliminando beneficio VIP:', id);

      await prisma.vipBenefit.delete({
        where: { id }
      });

      logger.info('✅ Beneficio VIP eliminado exitosamente');

      res.json({
        success: true,
        message: 'Beneficio eliminado exitosamente'
      });

    } catch (error) {
      logger.error('❌ Error eliminando beneficio VIP:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  // Calcular descuento VIP para un usuario
  static calculateVipDiscount = async (req: Request, res: Response) => {
    try {
      const { userId, totalAmount } = req.body;

      logger.info('💰 Calculando descuento VIP para usuario:', userId);

      // Verificar si el usuario es VIP (esto debería venir del user-service)
      // Por ahora simulamos la verificación
      const isVip = true; // Esto se obtendría del user-service

      if (!isVip) {
        return res.json({
          success: true,
          data: {
            isVip: false,
            discount: 0,
            finalAmount: totalAmount
          }
        });
      }

      // Obtener configuración VIP
      const vipConfig = await prisma.vipConfig.findFirst();
      
      if (!vipConfig) {
        return res.json({
          success: true,
          data: {
            isVip: true,
            discount: 0,
            finalAmount: totalAmount
          }
        });
      }

      // Calcular descuento
      const discountAmount = (totalAmount * vipConfig.discountPercentage) / 100;
      const finalAmount = totalAmount - discountAmount;

      logger.info('✅ Descuento VIP calculado:', {
        original: totalAmount,
        discount: discountAmount,
        final: finalAmount
      });

      res.json({
        success: true,
        data: {
          isVip: true,
          discountPercentage: vipConfig.discountPercentage,
          discountAmount,
          originalAmount: totalAmount,
          finalAmount,
          benefits: {
            priorityAccess: vipConfig.priorityAccess,
            exclusiveOffers: vipConfig.exclusiveOffers,
            premiumSupport: vipConfig.premiumSupport,
            earlyAccess: vipConfig.earlyAccess,
            freeShipping: vipConfig.freeShipping
          }
        }
      });

    } catch (error) {
      logger.error('❌ Error calculando descuento VIP:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  // Obtener estadísticas VIP
  static getVipStats = async (req: Request, res: Response) => {
    try {
      logger.info('📊 Obteniendo estadísticas VIP');

      const vipConfig = await prisma.vipConfig.findFirst({
        include: {
          benefits: true
        }
      });

      // Simular estadísticas (en producción vendrían de la base de datos)
      const stats = {
        totalVipUsers: 45,
        activeBenefits: vipConfig?.benefits.filter(b => b.isActive).length || 0,
        totalBenefits: vipConfig?.benefits.length || 0,
        averageDiscount: vipConfig?.discountPercentage || 0,
        monthlyVipSignups: 12,
        vipRevenue: 15420.50,
        benefitUsage: [
          { name: 'Descuento general', usage: 89 },
          { name: 'Acceso prioritario', usage: 67 },
          { name: 'Ofertas exclusivas', usage: 45 },
          { name: 'Soporte premium', usage: 23 }
        ]
      };

      logger.info('✅ Estadísticas VIP obtenidas');

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      logger.error('❌ Error obteniendo estadísticas VIP:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };
}
