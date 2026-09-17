import { FastifyRequest, FastifyReply } from 'fastify';
import { reportsService, ReportsService } from './reports.service.js';
import {
  TenderReportsParamsSchema,
  ReportIdParamsSchema,
  TenderBidderReportsParamsSchema,
  CreateReportRequestSchema,
} from './reports.schemas.js';
import { createSuccessResponse } from '../../utils/response.js';

export class ReportsController {
  private service: ReportsService;

  constructor(service?: ReportsService) {
    this.service = service || reportsService;
  }

  generateTenderReport = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = TenderReportsParamsSchema.parse(request.params);
    const body = CreateReportRequestSchema.parse(request.body || {});

    const report = await this.service.generateReport(params.tenderId, body);
    return reply.status(201).send(createSuccessResponse(report));
  };

  generateBidderReport = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = TenderBidderReportsParamsSchema.parse(request.params);
    const body = CreateReportRequestSchema.parse(request.body || {});

    const report = await this.service.generateReport(params.tenderId, {
      ...body,
      bidderId: params.bidderId,
      reportType: 'BIDDER_COMPLIANCE',
    });
    return reply.status(201).send(createSuccessResponse(report));
  };

  listReports = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = TenderReportsParamsSchema.parse(request.params);
    const query = request.query as { bidderId?: string };

    const reports = await this.service.listReportsByTender(params.tenderId, query.bidderId);
    return reply.status(200).send(createSuccessResponse(reports));
  };

  getReport = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = ReportIdParamsSchema.parse(request.params);
    const report = await this.service.getReportById(params.reportId);
    return reply.status(200).send(createSuccessResponse(report));
  };

  getReportStatus = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = ReportIdParamsSchema.parse(request.params);
    const report = await this.service.getReportById(params.reportId);
    return reply.status(200).send(
      createSuccessResponse({
        id: report.metadata.id,
        status: report.metadata.status,
        completenessStatus: report.metadata.completenessStatus,
        isStale: report.metadata.isStale,
        generatedAt: report.metadata.generatedAt,
        checksum: report.metadata.reportChecksum,
      })
    );
  };

  downloadReportPDF = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = ReportIdParamsSchema.parse(request.params);
    const { buffer, filename } = await this.service.generatePDF(params.reportId);

    return reply
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', `attachment; filename="${filename}"`)
      .send(buffer);
  };

  getReportAuditTimeline = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = ReportIdParamsSchema.parse(request.params);
    const report = await this.service.getReportById(params.reportId);
    return reply.status(200).send(createSuccessResponse(report.auditTimeline));
  };
}

export const reportsController = new ReportsController();
