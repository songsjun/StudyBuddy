import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import request from 'supertest';

import { POST as createGoalRoute } from '../../src/app/api/goals/route';
import { POST as createSubmissionRoute } from '../../src/app/api/submissions/route';
import { resetStudyGoalsForTests } from '../../src/lib/goals';
import { resetSubmissionStore } from '../../src/lib/submissions';

export type ApiTestServer = {
  server: Server;
  client: ReturnType<typeof request>;
  close: () => Promise<void>;
};

async function toWebRequest(req: IncomingMessage): Promise<Request> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const body = Buffer.concat(chunks);
  const url = new URL(req.url ?? '/', 'http://127.0.0.1');
  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(key, item);
      }
      continue;
    }

    if (value !== undefined) {
      headers.set(key, value);
    }
  }

  return new Request(url, {
    method: req.method,
    headers,
    body: body.length > 0 ? body : undefined,
    duplex: 'half' as RequestInit['duplex'],
  });
}

async function writeWebResponse(response: Response, res: ServerResponse): Promise<void> {
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  res.writeHead(response.status, headers);
  const payload = Buffer.from(await response.arrayBuffer());
  res.end(payload);
}

export function createApiTestServer(): ApiTestServer {
  resetStudyGoalsForTests();
  resetSubmissionStore();

  const server = createServer(async (req, res) => {
    const pathname = new URL(req.url ?? '/', 'http://127.0.0.1').pathname;

    if (req.method === 'POST' && pathname === '/api/goals') {
      const response = await createGoalRoute(await toWebRequest(req));
      await writeWebResponse(response, res);
      return;
    }

    if (req.method === 'POST' && pathname === '/api/submissions') {
      const response = await createSubmissionRoute(await toWebRequest(req));
      await writeWebResponse(response, res);
      return;
    }

    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  return {
    server,
    client: request(server),
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      }),
  };
}
