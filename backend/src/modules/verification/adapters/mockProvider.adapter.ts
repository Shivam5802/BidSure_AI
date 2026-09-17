import {
  VerificationAdapter,
  VerificationExecutionRequest,
  VerificationAdapterResult,
  VerificationProviderMode,
  VerificationType,
} from '../types/verification.types.js';
import { getMockFixture } from '../fixtures/mockVerificationFixtures.js';

export abstract class BaseMockVerificationAdapter implements VerificationAdapter {
  abstract providerCode: string;
  abstract providerName: string;
  abstract supportedVerificationTypes: VerificationType[];

  providerMode: VerificationProviderMode = VerificationProviderMode.MOCK;

  async verify(request: VerificationExecutionRequest): Promise<VerificationAdapterResult> {
    // Artificial small latency simulation (10ms) for testing stability
    await new Promise((res) => setTimeout(res, 10));

    const fixture = getMockFixture(request.requestedIdentifier, request.verificationType);

    return {
      providerCode: this.providerCode,
      providerName: this.providerName,
      providerMode: this.providerMode,
      status: fixture.status,
      responseSnapshot: fixture.responseSnapshot,
      normalizedResult: fixture.normalizedResult,
      matchSummary: fixture.matchSummary,
      confidence: fixture.confidence,
      sourceReference: `Mock Sandbox Database (${this.providerName})`,
      verifiedAt: new Date(),
    };
  }
}

export class MockGSTAdapter extends BaseMockVerificationAdapter {
  providerCode = 'MOCK_GST_PROVIDER';
  providerName = 'Demo GST Verification Provider';
  supportedVerificationTypes = [VerificationType.GST];
}

export class MockPANAdapter extends BaseMockVerificationAdapter {
  providerCode = 'MOCK_PAN_PROVIDER';
  providerName = 'Demo NSDL / PAN Verification Service';
  supportedVerificationTypes = [VerificationType.PAN];
}

export class MockUdyamAdapter extends BaseMockVerificationAdapter {
  providerCode = 'MOCK_UDYAM_PROVIDER';
  providerName = 'Demo MSME / Udyam Verification Portal';
  supportedVerificationTypes = [VerificationType.UDYAM];
}

export class MockBlacklistAdapter extends BaseMockVerificationAdapter {
  providerCode = 'MOCK_BLACKLIST_PROVIDER';
  providerName = 'Demo Debarment & Blacklisting Registry';
  supportedVerificationTypes = [VerificationType.BLACKLISTING, VerificationType.DEBARMENT];
}

export class MockGenericGovernmentAdapter extends BaseMockVerificationAdapter {
  providerCode = 'MOCK_GOVERNMENT_VERIFICATION';
  providerName = 'BidGuard Government Sandbox Verification Adapter';
  supportedVerificationTypes = Object.values(VerificationType);
}
