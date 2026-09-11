import { onRequest, type Request } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import { initializeApp } from 'firebase-admin/app';

import { handleExtractProduct } from './extract';
import { assertGate } from './gate';
import { handleCreateUploadUrl } from './upload';

initializeApp();
setGlobalOptions({ region: 'asia-south1', maxInstances: 10 });

type HttpResponse = {
  status: (code: number) => HttpResponse;
  json: (body: unknown) => void;
  send: (body?: string) => void;
};

type Handler = (req: Request, res: HttpResponse) => void | Promise<void>;

function errorStatus(error: unknown): number {
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: unknown }).status;
    if (typeof status === 'number') {
      return status;
    }
  }
  return 500;
}

function gated(handler: Handler, secrets: string[] = ['SHOP_PIN_HASH']) {
  return onRequest({ cors: true, invoker: 'public', secrets }, async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'POST required' });
      return;
    }

    const gate = assertGate(req);
    if (!gate.ok) {
      res.status(gate.status).json({ error: gate.error });
      return;
    }

    await handler(req, res);
  });
}

function notInThisPhase(_req: Request, res: HttpResponse) {
  res.status(501).json({ error: 'Not implemented until a later phase.', phase: 'F5' });
}

export const gatePing = gated((_req, res) => {
  res.status(200).json({ ok: true, phase: 'F4' });
});

export const createUploadUrl = gated(async (req, res) => {
  try {
    res.status(200).json(await handleCreateUploadUrl(req.body));
  } catch (error) {
    res.status(errorStatus(error)).json({
      error: error instanceof Error ? error.message : 'Could not create upload URL.',
    });
  }
});

export const extractProduct = gated(async (req, res) => {
  try {
    res.status(200).json(await handleExtractProduct(req.body));
  } catch (error) {
    res.status(errorStatus(error)).json({
      error: error instanceof Error ? error.message : 'Extract failed.',
    });
  }
}, ['SHOP_PIN_HASH', 'GEMINI_API_KEY']);

export const findByBarcode = gated(notInThisPhase);
export const upsertProduct = gated(notInThisPhase);
export const listProducts = gated(notInThisPhase);
