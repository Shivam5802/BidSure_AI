import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { createErrorResponse } from '../utils/response.js';

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  request.log.error(error, 'Centralized error handler caught error');

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const formattedErrors = error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      rule: issue.code,
    }));

    reply.status(400).send(
      createErrorResponse('VALIDATION_ERROR', 'Input validation failed', formattedErrors)
    );
    return;
  }

  // Handle Fastify built-in errors or inferred status codes
  const isNotFound =
    (error as FastifyError).statusCode === 404 ||
    (typeof error.message === 'string' && error.message.toLowerCase().includes('not found'));

  if (isNotFound) {
    reply.status(404).send(
      createErrorResponse('NOT_FOUND', error.message || 'The requested resource was not found')
    );
    return;
  }

  if (typeof error.message === 'string' && error.message.includes('CORS policy')) {
    reply.status(403).send(
      createErrorResponse('FORBIDDEN', error.message)
    );
    return;
  }

  const statusCode = (error as FastifyError).statusCode || 500;

  if (statusCode === 401) {
    reply.status(401).send(
      createErrorResponse('UNAUTHORIZED', error.message || 'Authentication required')
    );
    return;
  }

  if (statusCode === 403) {
    reply.status(403).send(
      createErrorResponse('FORBIDDEN', error.message || 'Access denied: insufficient permissions')
    );
    return;
  }

  if (statusCode >= 400 && statusCode < 500) {
    reply.status(statusCode).send(
      createErrorResponse('BAD_REQUEST', error.message || 'Invalid request')
    );
    return;
  }

  // Fallback for unexpected internal 500 errors - never leak stack traces or internals to client
  reply.status(500).send(
    createErrorResponse(
      'INTERNAL_SERVER_ERROR',
      'An unexpected internal error occurred. Please contact the administrator.'
    )
  );
}

export function notFoundHandler(request: FastifyRequest, reply: FastifyReply): void {
  reply.status(404).send(
    createErrorResponse('NOT_FOUND', `Route ${request.method} ${request.url} not found`)
  );
}
