import {
  VerificationAdapter,
  VerificationType,
  ProviderMetadata,
  VerificationErrorCode,
} from '../types/verification.types.js';
import {
  MockGSTAdapter,
  MockPANAdapter,
  MockUdyamAdapter,
  MockBlacklistAdapter,
  MockGenericGovernmentAdapter,
} from './mockProvider.adapter.js';

export class VerificationAdapterRegistry {
  private static instance: VerificationAdapterRegistry;
  private adaptersByCode: Map<string, VerificationAdapter> = new Map();
  private adaptersByType: Map<VerificationType, VerificationAdapter[]> = new Map();

  private constructor() {
    this.registerDefaultAdapters();
  }

  public static getInstance(): VerificationAdapterRegistry {
    if (!VerificationAdapterRegistry.instance) {
      VerificationAdapterRegistry.instance = new VerificationAdapterRegistry();
    }
    return VerificationAdapterRegistry.instance;
  }

  private registerDefaultAdapters() {
    this.registerAdapter(new MockGSTAdapter());
    this.registerAdapter(new MockPANAdapter());
    this.registerAdapter(new MockUdyamAdapter());
    this.registerAdapter(new MockBlacklistAdapter());
    this.registerAdapter(new MockGenericGovernmentAdapter());
  }

  public registerAdapter(adapter: VerificationAdapter): void {
    this.adaptersByCode.set(adapter.providerCode, adapter);

    for (const type of adapter.supportedVerificationTypes) {
      const existing = this.adaptersByType.get(type) || [];
      // avoid duplicates
      if (!existing.some((a) => a.providerCode === adapter.providerCode)) {
        existing.push(adapter);
        this.adaptersByType.set(type, existing);
      }
    }
  }

  public resolveAdapter(verificationType: VerificationType, providerCode?: string): VerificationAdapter {
    if (providerCode && this.adaptersByCode.has(providerCode)) {
      const adapter = this.adaptersByCode.get(providerCode)!;
      if (adapter.supportedVerificationTypes.includes(verificationType)) {
        return adapter;
      }
    }

    // Try finding specific adapter for type
    const adapters = this.adaptersByType.get(verificationType) || [];
    if (adapters.length > 0) {
      return adapters[0]!;
    }

    // Fallback to generic mock adapter
    const generic = this.adaptersByCode.get('MOCK_GOVERNMENT_VERIFICATION');
    if (generic) {
      return generic;
    }

    throw new Error(
      `${VerificationErrorCode.VERIFICATION_PROVIDER_NOT_FOUND}: No suitable verification adapter found for type ${verificationType} and code ${providerCode || 'default'}`
    );
  }

  public getProviderMetadataList(): ProviderMetadata[] {
    const list: ProviderMetadata[] = [];
    for (const adapter of this.adaptersByCode.values()) {
      list.push({
        providerCode: adapter.providerCode,
        providerName: adapter.providerName,
        verificationTypes: adapter.supportedVerificationTypes,
        mode: adapter.providerMode,
        enabled: true,
        supportsLive: false, // Per SIH prototype rule
        description: `Synthetic demonstration provider for ${adapter.providerName}. Does not connect to live government servers.`,
      });
    }
    return list;
  }
}
