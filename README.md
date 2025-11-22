# VoltTime Cloud API Client

Node.js client library for the VoltTime Cloud API.

## Installation

```bash
npm install
npm run build
```

## Usage

### Initialize the client

```typescript
import { VoltTimeClient } from './dist/index.js';

const client = new VoltTimeClient({
  apiKey: 'your-api-key-here'
});
```

### User Endpoints

#### Get current user details

```typescript
const user = await client.getCurrentUser();
console.log(user);
```

#### Get user by ID

```typescript
const user = await client.getUserDetails('user-id');
console.log(user);
```

### Site Endpoints

#### List all sites

```typescript
const sites = await client.getSites({
  page: 1,
  per_page: 20
});

console.log(sites.data);
console.log(`Total: ${sites.meta.per_page}`);
```

#### Get specific site

```typescript
const site = await client.getSite('site-uuid');
console.log(site);
```

### Charger Endpoints

#### List all chargers

```typescript
const chargers = await client.getChargers({
  page: 1,
  per_page: 20
});

console.log(chargers.data);
```

#### Get specific charger

```typescript
const charger = await client.getCharger('charger-uuid');
console.log(charger);
```

### Transaction Endpoints

#### Get transactions for a site

```typescript
const transactions = await client.getTransactionsBySite(
  'site-uuid',
  {
    page: 1,
    per_page: 50
  }
);

console.log(transactions.data);
```

#### Get all transactions (auto-pagination)

```typescript
// Automatically fetch all pages
const allTransactions = await client.getAllTransactionsBySite('site-uuid');

console.log(`Total transactions: ${allTransactions.length}`);

const totalKwh = allTransactions.reduce(
  (sum, tx) => sum + parseFloat(tx.total_kwh),
  0
);
console.log(`Total energy: ${totalKwh.toFixed(2)} kWh`);
```

### Tariff Endpoints

#### Get electricity tariffs

```typescript
const tariffs = await client.getTariffs('BE'); // Location code
console.log(`Found ${tariffs.length} tariffs`);

tariffs.forEach((tariff) => {
  console.log(`${tariff.timestamp}: €${tariff.price} (${tariff.type})`);
});
```

### Provider Endpoints

#### Get all OCPP providers

```typescript
const providers = await client.getProviders();
console.log(`Found ${providers.length} providers`);

providers.forEach((provider) => {
  console.log(`${provider.name}: ${provider.websocket_url}`);
});
```

### Product Endpoints

#### Get all products

```typescript
const products = await client.getProducts();
console.log(`Found ${products.length} products`);

products.forEach((product) => {
  console.log(`${product.name} (${product.sku}): €${product.price}`);
});
```

### Connector Endpoints

#### Get current power usage

```typescript
const powerUsage = await client.getConnectorPowerUsage(
  'charger-uuid',
  1 // connector ID
);

console.log(`Power: ${powerUsage.kW} kW`);
console.log(`L1: ${powerUsage.L1} A`);
console.log(`L2: ${powerUsage.L2} A`);
console.log(`L3: ${powerUsage.L3} A`);
```

#### Get latest meter values

```typescript
const meterValue = await client.getConnectorLatestMeterValue(
  'charger-uuid',
  1 // connector ID
);

console.log(`Connector ID: ${meterValue.connectorId}`);
const latest = meterValue.meterValue[0];
console.log(`Timestamp: ${latest.timestamp}`);

latest.sampledValue.forEach((sv) => {
  console.log(`${sv.measurand}: ${sv.value} ${sv.unit || ''}`);
});
```

### Legacy Aliases

For backward compatibility, these aliases are available:

```typescript
// Same as getChargers()
const chargePoints = await client.getChargePoints();

// Same as getCharger()
const chargePoint = await client.getChargePoint('charger-uuid');
```

## Error Handling

```typescript
import { VoltTimeAPIError } from './dist/index.js';

try {
  const user = await client.getCurrentUser();
} catch (error) {
  if (error instanceof VoltTimeAPIError) {
    console.error(`API Error: ${error.message}`);
    console.error(`Status Code: ${error.statusCode}`);
    console.error(`Response:`, error.responseData);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Environment Variables

Create a `.env` file for your API key:

```env
VOLTTIME_API_KEY=your-api-key-here
```

Then run:

```bash
node dist/example.js
```

## API Reference

### VoltTimeClient

#### Constructor

```typescript
new VoltTimeClient(config: VoltTimeConfig)
```

- `config.apiKey` (required): Your VoltTime API key
- `config.baseUrl` (optional): Custom API base URL (defaults to `https://app.plugchoice.com/api/v3`)

#### Methods

**User**

- `getCurrentUser(): Promise<User>`
- `getUserDetails(userId: string): Promise<User>`

**Sites**

- `getSites(params?: PaginationParams): Promise<PaginatedResponse<Site>>`
- `getSite(siteUuid: string): Promise<Site>`

**Chargers**

- `getChargers(params?: PaginationParams): Promise<PaginatedResponse<Charger>>`
- `getCharger(chargerUuid: string): Promise<Charger>`

**Transactions**

- `getTransactionsBySite(siteUuid: string, params?: TransactionParams): Promise<PaginatedResponse<Transaction>>`
- `getAllTransactionsBySite(siteUuid: string, params?: TransactionParams): Promise<Transaction[]>`

**Tariffs**

- `getTariffs(location: string): Promise<Tariff[]>`

**Providers**

- `getProviders(): Promise<Provider[]>`

**Products**

- `getProducts(): Promise<Product[]>`

**Connectors**

- `getConnectorPowerUsage(chargerUuid: string, connectorId: number): Promise<ConnectorPowerUsage>`
- `getConnectorLatestMeterValue(chargerUuid: string, connectorId: number): Promise<ConnectorMeterValue>`

**Legacy Aliases**

- `getChargePoints(params?: PaginationParams): Promise<PaginatedResponse<ChargePoint>>`
- `getChargePoint(chargePointId: string): Promise<ChargePoint>`

## Types

See `src/types.ts` for full type definitions including:

- `User`, `Site`, `Charger`, `Transaction`
- `Tariff`, `Provider`, `Product`
- `ConnectorPowerUsage`, `ConnectorMeterValue`, `SampledValue`, `MeterValue`
- `PaginatedResponse<T>`, `PaginationParams`, `TransactionParams`

## Example

See `example.ts` for a complete working example demonstrating all endpoints.

## License

MIT
