import { Axiom } from '@axiomhq/js';

const token = import.meta.env.AXIOM_TOKEN;
const dataset = import.meta.env.AXIOM_DATASET;

const axiom = token && dataset ? new Axiom({ token }) : null;

function send(level: 'info' | 'warn' | 'error', data: Record<string, unknown>) {
  const entry = { ...data, level, _time: new Date().toISOString() };

  // Always log to console (Vercel's built-in log viewer)
  const json = JSON.stringify(entry);
  if (level === 'error') {
    console.error(json);
  } else if (level === 'warn') {
    console.warn(json);
  } else {
    console.log(json);
  }

  // Send to Axiom (buffered, call flush() before returning response)
  if (axiom && dataset) {
    axiom.ingest(dataset, [entry]);
  }
}

export const log = {
  info: (data: Record<string, unknown>) => send('info', data),
  warn: (data: Record<string, unknown>) => send('warn', data),
  error: (data: Record<string, unknown>) => send('error', data),

  /** Flush buffered events to Axiom. Call before returning a response in serverless. */
  async flush() {
    if (axiom) {
      await axiom.flush();
    }
  },
};
