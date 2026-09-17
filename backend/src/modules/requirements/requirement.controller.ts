import { FastifyReply, FastifyRequest } from 'fastify';
import { requirementService } from './requirement.service.js';
import {
  TenderIdParamSchema,
  RequirementIdParamSchema,
  RequirementFilterQuerySchema,
  UpdateRequirementBodySchema,
} from './requirement.schema.js';

export async function triggerRequirementExtractionHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { tenderId } = TenderIdParamSchema.parse(request.params);
  const result = await requirementService.triggerExtraction(tenderId);

  return reply.status(202).send({
    success: true,
    message: 'Requirement extraction process started asynchronously',
    data: result,
  });
}

export async function getBlueprintHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { tenderId } = TenderIdParamSchema.parse(request.params);
  const { version } = request.query as { version?: string };

  const versionNum = version ? parseInt(version, 10) : undefined;
  const result = await requirementService.getBlueprint(tenderId, versionNum);

  if (!result) {
    return reply.status(404).send({
      success: false,
      error: `Compliance Blueprint for tender ${tenderId} not found. Trigger extraction first.`,
    });
  }

  return reply.status(200).send({
    success: true,
    data: result,
  });
}

export async function getBlueprintVersionsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { tenderId } = TenderIdParamSchema.parse(request.params);
  const versions = await requirementService.getBlueprintVersions(tenderId);

  return reply.status(200).send({
    success: true,
    data: versions,
  });
}

export async function listRequirementsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { tenderId } = TenderIdParamSchema.parse(request.params);
  const query = RequirementFilterQuerySchema.parse(request.query);

  const requirements = await requirementService.listRequirements(tenderId, {
    category: query.category,
    status: query.status,
    ambiguityFlag: query.ambiguity,
    conflictFlag: query.conflict,
    duplicateFlag: query.duplicate,
    search: query.search,
  });

  return reply.status(200).send({
    success: true,
    count: requirements.length,
    data: requirements,
  });
}

export async function getRequirementHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { requirementId } = RequirementIdParamSchema.parse(request.params);
  const requirement = await requirementService.getRequirement(requirementId);

  return reply.status(200).send({
    success: true,
    data: requirement,
  });
}

export async function updateRequirementHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { requirementId } = RequirementIdParamSchema.parse(request.params);
  const body = UpdateRequirementBodySchema.parse(request.body);

  const updated = await requirementService.updateRequirement(requirementId, body);

  return reply.status(200).send({
    success: true,
    message: 'Requirement updated successfully',
    data: updated,
  });
}

export async function approveRequirementHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { requirementId } = RequirementIdParamSchema.parse(request.params);
  const updated = await requirementService.approveRequirement(requirementId);

  return reply.status(200).send({
    success: true,
    message: 'Requirement approved',
    data: updated,
  });
}

export async function rejectRequirementHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { requirementId } = RequirementIdParamSchema.parse(request.params);
  const updated = await requirementService.rejectRequirement(requirementId);

  return reply.status(200).send({
    success: true,
    message: 'Requirement rejected',
    data: updated,
  });
}

export async function lockBlueprintHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { tenderId } = TenderIdParamSchema.parse(request.params);
  const { blueprintId } = request.body as { blueprintId: string };

  const locked = await requirementService.lockBlueprint(tenderId, blueprintId);

  return reply.status(200).send({
    success: true,
    message: 'Blueprint locked successfully',
    data: locked,
  });
}
