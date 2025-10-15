import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'User Service API',
            version: '1.0.0',
            description: 'API para el servicio de usuarios de Ticketing Platform',
            contact: {
                name: 'Ticketing Platform Team',
                email: 'admin@ticketing.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Servidor de desarrollo',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT token para autenticación',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    required: ['email', 'password', 'name'],
                    properties: {
                        id: {
                            type: 'string',
                            description: 'ID único del usuario',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Email del usuario',
                        },
                        name: {
                            type: 'string',
                            description: 'Nombre completo del usuario',
                        },
                        isVerified: {
                            type: 'boolean',
                            description: 'Si el usuario ha verificado su email',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha de creación',
                        },
                    },
                },
                Event: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'ID único del evento',
                        },
                        title: {
                            type: 'string',
                            description: 'Título del evento',
                        },
                        description: {
                            type: 'string',
                            description: 'Descripción del evento',
                        },
                        date: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha del evento',
                        },
                        venue: {
                            type: 'string',
                            description: 'Lugar del evento',
                        },
                        price: {
                            type: 'number',
                            description: 'Precio del ticket',
                        },
                    },
                },
                Ticket: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'ID único del ticket',
                        },
                        eventId: {
                            type: 'string',
                            description: 'ID del evento',
                        },
                        userId: {
                            type: 'string',
                            description: 'ID del usuario propietario',
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'confirmed', 'cancelled'],
                            description: 'Estado del ticket',
                        },
                        purchaseDate: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha de compra',
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        error: {
                            type: 'string',
                            description: 'Mensaje de error',
                        },
                    },
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true,
                        },
                        data: {
                            type: 'object',
                            description: 'Datos de respuesta',
                        },
                    },
                },
            },
        },
        tags: [
            {
                name: 'Authentication',
                description: 'Operaciones de autenticación y autorización',
            },
            {
                name: 'Events',
                description: 'Gestión de eventos',
            },
            {
                name: 'Tickets',
                description: 'Gestión de tickets',
            },
            {
                name: 'Users',
                description: 'Gestión de usuarios',
            },
            {
                name: 'Health',
                description: 'Health checks del servicio',
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Application): void => {
    // Swagger UI
    app.use(
        '/api/docs',
        swaggerUi.serve,
        swaggerUi.setup(specs, {
            explorer: true,
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: 'User Service API - Ticketing Platform',
        })
    );

    // Swagger JSON
    app.get('/api/docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(specs);
    });

    console.log('[DOCS] Swagger UI disponible en: http://localhost:3001/api/docs');
};

export { specs };
