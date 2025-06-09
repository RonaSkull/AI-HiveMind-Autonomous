import { tradingAgent } from './agents/AITradingAgent';
import { logger } from './utils/logger';

async function main() {
  try {
    // Start the trading agent
    await tradingAgent.start();
    logger.info('AI Trading Agent started');

    // Example market data
    const marketData = {
      symbol: 'BTC/USD',
      price: 50234.56,
      volume: 24567890,
      timestamp: new Date().toISOString(),
      indicators: {
        rsi: 62.3,
        macd: 125.4,
        ema20: 49876.5,
        ema50: 48765.3
      }
    };

    // Update market data
    await tradingAgent.updateMarketData(marketData);
    logger.info('Market data updated');

    // Analyze market
    const analysis = await tradingAgent.enqueueTask({
      type: 'ANALYZE_MARKET',
      data: marketData
    });

    logger.info('Market Analysis:', { analysis });

    // Generate trading signal
    const signal = await tradingAgent.enqueueTask({
      type: 'GENERATE_SIGNAL',
      data: { price: marketData.price, volume: marketData.volume }
    }, 1); // Higher priority

    logger.info('Trading Signal:', { signal });

  } catch (error) {
    logger.error('Error in main:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down...');
  await tradingAgent.stop();
  process.exit(0);
});

// Start the application
main().catch(error => {
  logger.error('Unhandled error:', error);
  process.exit(1);
});
