import 'dotenv/config';
import { VoltTimeClient, VoltTimeAPIError } from './src/index.js';

async function main() {
  // Initialize the client
  const client = new VoltTimeClient({
    apiKey: process.env.VOLTTIME_API_KEY || 'your-api-key-here',
  });

  try {
    // Test basic connectivity first
    console.log('Testing VoltTime API connection...');
    console.log('Base URL:', 'https://app.plugchoice.com/api/v3');

    // Get current user
    console.log('\n=== Current User ===');
    const user = await client.getCurrentUser();
    console.log('User:', user.name);
    console.log('Email:', user.email);
    console.log('UUID:', user.uuid);

    // Get sites
    console.log('\n=== Sites ===');
    const sites = await client.getSites({ page: 1, per_page: 10 });
    console.log(`Found ${sites.data.length} sites`);
    sites.data.forEach((site) => {
      console.log(`  - ${site.name} (${site.city}, ${site.country})`);
    });

    // Get chargers
    console.log('\n=== Chargers ===');
    const chargers = await client.getChargers({ page: 1, per_page: 10 });
    console.log(`Found ${chargers.data.length} chargers`);
    chargers.data.forEach((charger) => {
      console.log(
        `  - ${charger.identity}: ${charger.connection_status} (Setup: ${charger.setup_completed})`
      );
    });

    // Get transactions for first site (if available)
    if (sites.data.length > 0) {
      const firstSite = sites.data[0];
      console.log(`\n=== Transactions for ${firstSite.name} ===`);
      try {
        const transactions = await client.getTransactionsBySite(
          firstSite.uuid,
          {
            page: 1,
            per_page: 10,
          }
        );
        console.log(`Found ${transactions.data.length} transactions`);
        transactions.data.forEach((tx) => {
          console.log(
            `  - ${tx.started_at}: ${tx.total_kwh} kWh, Cost: ${
              tx.total_cost || 'N/A'
            }`
          );
        });

        // Get all transactions for the site
        console.log(
          `\n=== All Transactions for ${firstSite.name} (auto-pagination) ===`
        );
        const allTransactions = await client.getAllTransactionsBySite(
          firstSite.uuid
        );
        console.log(`Total transactions: ${allTransactions.length}`);

        const totalKwh = allTransactions.reduce(
          (sum, tx) => sum + parseFloat(tx.total_kwh),
          0
        );
        const totalCost = allTransactions.reduce(
          (sum, tx) => sum + parseFloat(tx.total_cost || '0'),
          0
        );
        console.log(`Total energy: ${totalKwh.toFixed(2)} kWh`);
        console.log(`Total cost: €${totalCost.toFixed(2)}`);
      } catch (error) {
        if (error instanceof VoltTimeAPIError) {
          console.log(
            `No transactions found or error: ${error.message} (Status: ${error.statusCode})`
          );
        }
      }
    }

    // Get tariffs
    console.log('\n=== Tariffs ===');
    try {
      const tariffs = await client.getTariffs('BE');
      console.log(`Found ${tariffs.length} tariffs for Belgium`);
      tariffs.slice(0, 5).forEach((tariff) => {
        console.log(
          `  - ${tariff.timestamp}: €${tariff.price} (${tariff.type}, Tax included: ${tariff.price_includes_tax})`
        );
      });
    } catch (error) {
      if (error instanceof VoltTimeAPIError) {
        console.log(
          `No tariffs found or error: ${error.message} (Status: ${error.statusCode})`
        );
      }
    }

    // Get providers
    console.log('\n=== Providers ===');
    try {
      const providers = await client.getProviders();
      console.log(`Found ${providers.length} providers`);
      providers.forEach((provider) => {
        console.log(`  - ${provider.name}: ${provider.websocket_url}`);
      });
    } catch (error) {
      if (error instanceof VoltTimeAPIError) {
        console.log(
          `No providers found or error: ${error.message} (Status: ${error.statusCode})`
        );
      }
    }

    // Get products
    console.log('\n=== Products ===');
    try {
      const products = await client.getProducts();
      console.log(`Found ${products.length} products`);
      products.forEach((product) => {
        console.log(
          `  - ${product.name} (${product.sku}): €${product.price} - Active: ${product.active}`
        );
      });
    } catch (error) {
      if (error instanceof VoltTimeAPIError) {
        console.log(
          `No products found or error: ${error.message} (Status: ${error.statusCode})`
        );
      }
    }

    // Get connector power usage for first charger
    if (chargers.data.length > 0) {
      const firstCharger = chargers.data[0];
      console.log(
        `\n=== Connector Power Usage for ${firstCharger.identity} ===`
      );
      try {
        const powerUsage = await client.getConnectorPowerUsage(
          firstCharger.uuid,
          1
        );
        console.log(`Timestamp: ${powerUsage.timestamp}`);
        console.log(`Power: ${powerUsage.kW} kW`);
        console.log(`L1: ${powerUsage.L1} A`);
        console.log(`L2: ${powerUsage.L2} A`);
        console.log(`L3: ${powerUsage.L3} A`);
      } catch (error) {
        if (error instanceof VoltTimeAPIError) {
          console.log(
            `No power usage data or error: ${error.message} (Status: ${error.statusCode})`
          );
        }
      }

      // Get connector meter values
      console.log(
        `\n=== Connector Meter Values for ${firstCharger.identity} ===`
      );
      try {
        const meterValue = await client.getConnectorLatestMeterValue(
          firstCharger.uuid,
          1
        );
        console.log(`Connector ID: ${meterValue.connectorId}`);
        if (meterValue.meterValue.length > 0) {
          const latest = meterValue.meterValue[0];
          console.log(`Timestamp: ${latest.timestamp}`);
          console.log(`Sampled values: ${latest.sampledValue.length}`);
          latest.sampledValue.slice(0, 3).forEach((sv) => {
            console.log(
              `  - ${sv.measurand}: ${sv.value} ${sv.unit || ''} (${
                sv.context
              })`
            );
          });
        }
      } catch (error) {
        if (error instanceof VoltTimeAPIError) {
          console.log(
            `No meter values or error: ${error.message} (Status: ${error.statusCode})`
          );
        }
      }
    }
  } catch (error) {
    if (error instanceof VoltTimeAPIError) {
      console.error(`API Error: ${error.message}`);
      console.error(`Status Code: ${error.statusCode}`);
      console.error(`Response:`, error.responseData);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

main();
