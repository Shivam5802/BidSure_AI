import { FastifyReply, FastifyRequest } from 'fastify';
import { healthService } from './health.service.js';
import { createSuccessResponse } from '../../utils/response.js';

export class HealthController {
  async getHealth(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const health = healthService.getHealthStatus();
    reply.status(200).send(createSuccessResponse(health));
  }

  async getMetadata(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const metadata = healthService.getApiMetadata();
    reply.status(200).send(createSuccessResponse(metadata));
  }
}

export const healthController = new HealthController();
