import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  VoltTimeConfig,
  User,
  Site,
  Charger,
  Transaction,
  Tariff,
  TariffRequest,
  Provider,
  Product,
  ConnectorPowerUsage,
  ConnectorMeterValue,
  ChargePoint,
  ChargeSession,
  PaginatedResponse,
  ChargeSessionParams,
  TransactionParams,
  PaginationParams,
} from './types.js';

export class VoltTimeAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseData?: any
  ) {
    super(message);
    this.name = 'VoltTimeAPIError';
  }
}

export class VoltTimeClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(config: VoltTimeConfig) {
    this.baseUrl = config.baseUrl || 'https://app.plugchoice.com/api/v3';

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<any>) => {
        if (error.response) {
          throw new VoltTimeAPIError(
            error.response.data?.message || error.message,
            error.response.status,
            error.response.data
          );
        }
        throw new VoltTimeAPIError(error.message);
      }
    );
  }

  // User endpoints
  async getUserDetails(userId: string): Promise<User> {
    const response = await this.client.get<User>(`/user/${userId}`);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/user');
    return response.data;
  }

  // Site endpoints
  async getSites(params?: PaginationParams): Promise<PaginatedResponse<Site>> {
    const response = await this.client.get<PaginatedResponse<Site>>('/sites', {
      params,
    });
    return response.data;
  }

  async getSite(siteUuid: string): Promise<Site> {
    const response = await this.client.get<Site>(`/sites/${siteUuid}`);
    return response.data;
  }

  // Charger endpoints
  async getChargers(
    params?: PaginationParams
  ): Promise<PaginatedResponse<Charger>> {
    const response = await this.client.get<PaginatedResponse<Charger>>(
      '/chargers',
      {
        params,
      }
    );
    return response.data;
  }

  async getCharger(chargerUuid: string): Promise<Charger> {
    const response = await this.client.get<Charger>(`/chargers/${chargerUuid}`);
    return response.data;
  }

  // Transaction endpoints
  async getTransactionsBySite(
    siteUuid: string,
    params?: TransactionParams
  ): Promise<PaginatedResponse<Transaction>> {
    const response = await this.client.get<PaginatedResponse<Transaction>>(
      `/sites/${siteUuid}/transactions`,
      { params }
    );
    return response.data;
  }

  async getAllTransactionsBySite(
    siteUuid: string,
    params?: TransactionParams
  ): Promise<Transaction[]> {
    const transactions: Transaction[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.getTransactionsBySite(siteUuid, {
        ...params,
        page,
        per_page: params?.per_page || 100,
      });

      transactions.push(...response.data);

      hasMore = page < (response.meta?.total_pages || 0);
      page++;
    }

    return transactions;
  }

  // Legacy aliases for backward compatibility
  async getChargePoints(
    params?: PaginationParams
  ): Promise<PaginatedResponse<ChargePoint>> {
    return this.getChargers(params);
  }

  async getChargePoint(chargePointId: string): Promise<ChargePoint> {
    return this.getCharger(chargePointId);
  }

  // Tariff endpoints
  async getTariffs(location: string): Promise<Tariff[]> {
    const response = await this.client.get<{ data: Tariff[] }>('/tariffs', {
      data: { location },
    });
    return response.data.data;
  }

  // Provider endpoints
  async getProviders(): Promise<Provider[]> {
    const response = await this.client.get<{ data: Provider[] }>('/providers');
    return response.data.data;
  }

  // Product endpoints
  async getProducts(): Promise<Product[]> {
    const response = await this.client.get<{ data: Product[] }>('/products');
    return response.data.data;
  }

  // Connector endpoints
  async getConnectorPowerUsage(
    chargerUuid: string,
    connectorId: number
  ): Promise<ConnectorPowerUsage> {
    const response = await this.client.get<ConnectorPowerUsage>(
      `/chargers/${chargerUuid}/connectors/${connectorId}/power-usage`
    );
    return response.data;
  }

  async getConnectorLatestMeterValue(
    chargerUuid: string,
    connectorId: number
  ): Promise<ConnectorMeterValue> {
    const response = await this.client.get<ConnectorMeterValue>(
      `/chargers/${chargerUuid}/connectors/${connectorId}/latest-metervalue`
    );
    return response.data;
  }
}
