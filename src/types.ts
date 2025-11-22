export interface VoltTimeConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface User {
  uuid: string;
  id: number;
  name: string;
  email: string;
  intercom?: {
    hmac_android?: string;
    hmac_ios?: string;
    hmac_web?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Site {
  uuid: string;
  id: number;
  name: string;
  street: string;
  postal_code: string;
  house_number: number;
  house_number_addition?: string;
  city: string;
  country: string;
  capabilities?: {
    smart_charging?: boolean;
    load_management?: {
      dynamic?: boolean;
      peak_shaving?: boolean;
      solar?: boolean;
    };
  };
  created_at: string;
  updated_at: string;
}

export interface Charger {
  uuid: string;
  id: number;
  identity: string;
  reference?: string;
  connection_status: string;
  status?: string;
  error?: string;
  error_info?: string;
  vendor_id?: string;
  vendor_error_code?: string;
  setup_completed: boolean;
  created_at: string;
  updated_at: string;
  licenses?: {
    smart?: boolean;
    pro?: boolean;
  };
}

export interface Transaction {
  id: number;
  charger_id: number;
  charger_connector_id: number;
  reservation_id?: number;
  id_tag: string;
  meter_start: number;
  meter_stop?: number;
  total_kwh: string;
  start_cost: string;
  kwh_cost: string;
  total_kwh_cost?: string;
  total_cost?: string;
  started_at: string;
  stopped_at?: string;
  stop_reason?: string;
  created_at: string;
  updated_at: string;
}

// Legacy aliases for backward compatibility
export interface ChargePoint extends Charger {}
export interface ChargeSession extends Transaction {}

export interface Tariff {
  type: string;
  location: string;
  timestamp: string;
  price: number;
  price_includes_tax: boolean;
}

export interface TariffRequest {
  location: string;
}

export interface Provider {
  name: string;
  websocket_url: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  active: boolean;
  digital: boolean;
  price: number;
}

export interface ConnectorPowerUsage {
  timestamp: string;
  L1: string;
  L2: string;
  L3: string;
  kW: string;
}

export interface SampledValue {
  value: string;
  context?: string;
  format?: string;
  measurand?: string;
  phase?: string;
  location?: string;
  unit?: string;
}

export interface MeterValue {
  timestamp: string;
  sampledValue: SampledValue[];
}

export interface ConnectorMeterValue {
  connectorId: number;
  meterValue: MeterValue[];
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first?: string;
    last?: string;
    prev?: string;
    next?: string;
  };
  meta: {
    current_page: number;
    current_page_url?: string;
    from?: number;
    path?: string;
    per_page: number;
    to?: number;
    total_pages?: number;
  };
}

export interface DateRangeParams {
  start_date?: string;
  end_date?: string;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export interface ChargeSessionParams extends DateRangeParams, PaginationParams {
  charge_point_id?: string;
  user_id?: string;
  status?: 'active' | 'completed' | 'stopped';
}

export interface TransactionParams extends PaginationParams {
  // Add transaction-specific filters if needed
}
