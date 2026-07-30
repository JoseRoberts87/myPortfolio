/**
 * Server-Sent Events endpoint for the real-time streaming demo (issue #78).
 *
 * Emits a synthetic pipeline event roughly every 700ms as `text/event-stream`.
 * Self-contained in the Next server, so it works wherever the frontend is
 * deployed (Vercel / ECS) without depending on the FastAPI backend. The client
 * (`useLiveStream`) consumes this via EventSource and falls back to local
 * generation if the stream is unavailable.
 */
import { generateEvent } from '@/lib/streaming';

// Never cache or statically optimize — this is a live stream.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TICK_MS = 700;

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  let interval: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = () => {
        try {
          const event = generateEvent(Date.now());
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          // Controller closed (client went away) — stop ticking.
          if (interval) clearInterval(interval);
        }
      };

      // Prime the stream immediately, then tick.
      send();
      interval = setInterval(send, TICK_MS);

      // Stop when the client disconnects.
      request.signal.addEventListener('abort', () => {
        if (interval) clearInterval(interval);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      });
    },
    cancel() {
      if (interval) clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
