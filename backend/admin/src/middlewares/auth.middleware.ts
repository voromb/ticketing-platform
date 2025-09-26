import { FastifyReply, FastifyRequest } from 'fastify';

export async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
        await request.jwtVerify();
    } catch (error) {
        reply.status(401).send({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Authentication required',
        });
    }
}
