import { tradingAgent } from '../agents/AITradingAgent';
import { cerebrasClient } from '../ai/cerebras';

// Mock the cerebras client
jest.mock('../ai/cerebras', () => ({
  cerebrasClient: {
    analyzeMarket: jest.fn(),
    generateTradingSignal: jest.fn(),
  },
}));

describe('AITradingAgent', () => {
  beforeAll(async () => {
    await tradingAgent.start();
  });

  afterAll(async () => {
    await tradingAgent.stop();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeMarket', () => {
    it('should analyze market data', async () => {
      const mockAnalysis = 'Market shows bullish trends with increasing volume';
      (cerebrasClient.analyzeMarket as jest.Mock).mockResolvedValue(mockAnalysis);

      const marketData = {
        symbol: 'BTC/USD',
        price: 50000,
        volume: 1000000,
      };

      const result = await tradingAgent.enqueueTask({
        type: 'ANALYZE_MARKET',
        data: marketData,
      });

      expect(cerebrasClient.analyzeMarket).toHaveBeenCalledWith(marketData);
      expect(result).toBe(mockAnalysis);
    });
  });

  describe('generateTradingSignal', () => {
    it('should generate a trading signal', async () => {
      const mockSignal = 'BUY';
      (cerebrasClient.generateTradingSignal as jest.Mock).mockResolvedValue(mockSignal);

      const marketData = {
        price: 50000,
        volume: 1000000,
      };

      const result = await tradingAgent.enqueueTask({
        type: 'GENERATE_SIGNAL',
        data: marketData,
      });

      expect(cerebrasClient.generateTradingSignal).toHaveBeenCalledWith(
        expect.objectContaining(marketData)
      );
      expect(result.signal).toBe(mockSignal);
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('market data management', () => {
    it('should update and retrieve market data', async () => {
      const marketData = {
        symbol: 'ETH/USD',
        price: 3000,
        volume: 500000,
      };

      await tradingAgent.updateMarketData(marketData);
      const retrievedData = tradingAgent.getCurrentMarketData();

      expect(retrievedData).toMatchObject(marketData);
    });
  });
});
