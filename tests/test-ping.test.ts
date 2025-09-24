import { execute } from '../src/commands/ping';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

// Mock ChatInputCommandInteraction
const createMockInteraction = (pingValue = 50) => {
  let replyData: any = null;

  const mockInteraction = {
    createdTimestamp: Date.now(),
    client: {
      ws: {
        ping: pingValue,
      },
    },
    reply: (options: any) => {
      replyData = options;
      return Promise.resolve();
    },
  } as unknown as ChatInputCommandInteraction;

  return { mockInteraction, getReply: () => replyData };
};

describe('Ping Command', () => {
  test('should respond with pong message and latency information', async () => {
    const { mockInteraction, getReply } = createMockInteraction();

    await execute(mockInteraction);
    const response = getReply();

    expect(response).toBeDefined();
    expect(response.content).toContain('Pong!');
    expect(response.content).toContain('Response Latency:');
    expect(response.content).toContain('API Latency:');
    expect(response.content).toContain('ms');
    expect(response.flags).toBe(MessageFlags.Ephemeral);
  });

  test('should include API ping from client', async () => {
    const { mockInteraction, getReply } = createMockInteraction(123);

    await execute(mockInteraction);
    const response = getReply();

    expect(response.content).toContain('API Latency: 123ms');
  });

  test('should handle zero API ping', async () => {
    const { mockInteraction, getReply } = createMockInteraction(0);

    await execute(mockInteraction);
    const response = getReply();

    expect(response.content).toContain('API Latency: 0ms');
  });

  test('should handle high API ping', async () => {
    const { mockInteraction, getReply } = createMockInteraction(999);

    await execute(mockInteraction);
    const response = getReply();

    expect(response.content).toContain('API Latency: 999ms');
  });

  test('should calculate response latency accurately', async () => {
    const { mockInteraction, getReply } = createMockInteraction();

    await execute(mockInteraction);
    const response = getReply();

    expect(response.content).toContain('Response Latency:');

    // Extract the response latency from the message
    const latencyMatch = response.content.match(/Response Latency: (\d+)ms/);
    expect(latencyMatch).toBeTruthy();

    if (latencyMatch) {
      const latency = parseInt(latencyMatch[1]);
      expect(latency).toBeGreaterThanOrEqual(0);
      expect(latency).toBeLessThan(1000); // Should be reasonable
    }
  });
});
