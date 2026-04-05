export function createMockQueue(): Queue<unknown> {
  return {
    send: vi.fn(async (_message: unknown) => {}),
    sendBatch: vi.fn(
      async (
        _messages: Iterable<MessageSendRequest<unknown>>,
        _options?: QueueSendBatchOptions,
      ) => {},
    ),
  };
}
