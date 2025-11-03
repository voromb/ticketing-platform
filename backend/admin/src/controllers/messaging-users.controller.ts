import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MessagingUsersController {
  // GET /api/messaging-users/admins - Lista simplificada de admins para mensajería
  async getAdminsForMessaging(request: FastifyRequest, reply: FastifyReply) {
    try {
      const admins = await prisma.admin.findMany({
        where: {
          isActive: true
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true
        },
        orderBy: {
          firstName: 'asc'
        }
      });

      // Formatear respuesta
      const formattedAdmins = admins.map(admin => ({
        id: admin.id,
        _id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        name: `${admin.firstName} ${admin.lastName}`,
        role: admin.role
      }));

      return reply.status(200).send(formattedAdmins);
    } catch (error) {
      console.error('Error fetching admins for messaging:', error);
      return reply.status(500).send({
        error: 'Error al obtener la lista de administradores'
      });
    }
  }

  // GET /api/messaging-users/company-admins - Lista simplificada de company admins para mensajería
  async getCompanyAdminsForMessaging(request: FastifyRequest, reply: FastifyReply) {
    try {
      const companyAdmins = await prisma.companyAdmin.findMany({
        where: {
          deleted_at: null,
          is_active: true
        },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          company_id: true
        },
        orderBy: {
          first_name: 'asc'
        }
      });

      // Formatear respuesta
      const formattedAdmins = companyAdmins.map(admin => ({
        id: admin.id,
        _id: admin.id,
        email: admin.email,
        firstName: admin.first_name,
        name: `${admin.first_name} ${admin.last_name}`,
        companyId: admin.company_id
      }));

      return reply.status(200).send(formattedAdmins);
    } catch (error) {
      console.error('Error fetching company admins for messaging:', error);
      return reply.status(500).send({
        error: 'Error al obtener la lista de gestores de servicios'
      });
    }
  }

  // GET /api/messaging-users/all-admins - Todos los tipos de admins combinados
  async getAllAdminsForMessaging(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Obtener admins regulares
      const admins = await prisma.admin.findMany({
        where: {
          isActive: true
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true
        }
      });

      // Obtener company admins
      const companyAdmins = await prisma.companyAdmin.findMany({
        where: {
          deleted_at: null,
          is_active: true
        },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          company_id: true
        }
      });

      // Combinar y formatear
      const allAdmins = [
        ...admins.map(admin => ({
          id: admin.id,
          _id: admin.id,
          email: admin.email,
          firstName: admin.firstName,
          name: `${admin.firstName} ${admin.lastName}`,
          type: admin.role
        })),
        ...companyAdmins.map(admin => ({
          id: admin.id,
          _id: admin.id,
          email: admin.email,
          firstName: admin.first_name,
          name: `${admin.first_name} ${admin.last_name}`,
          type: 'COMPANY_ADMIN'
        }))
      ];

      return reply.status(200).send(allAdmins);
    } catch (error) {
      console.error('Error fetching all admins for messaging:', error);
      return reply.status(500).send({
        error: 'Error al obtener la lista de administradores'
      });
    }
  }
}
