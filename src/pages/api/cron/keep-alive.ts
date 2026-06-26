import type { APIRoute } from 'astro';
import { CRON_SECRET } from 'astro:env/server';
import { supabase } from '../../../lib/supabase';
import { log } from '../../../lib/logger';

export const prerender = false;

/**
 * Keep-alive cron endpoint. Triggered daily by Vercel Cron (see vercel.json).
 *
 * Supabase free-tier projects pause after ~7 days of inactivity. Running a real
 * database query (not just a REST metadata hit) counts as activity and keeps the
 * project awake. Vercel runs this from its own scheduler, so — unlike GitHub
 * Actions scheduled workflows — it is never auto-disabled for repo inactivity.
 */
export const GET: APIRoute = async ({ request }) => {
  // Vercel automatically attaches `Authorization: Bearer <CRON_SECRET>` to cron
  // invocations when CRON_SECRET is set, so we can reject anything else.
  if (CRON_SECRET) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      log.warn({ event: 'keep_alive', warning: 'unauthorized' });
      await log.flush();
      return new Response('Unauthorized', { status: 401 });
    }
  }

  const { error } = await supabase.from('orders').select('id').limit(1);

  if (error) {
    log.error({ event: 'keep_alive', status: 'failed', error: error.message });
    await log.flush();
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  log.info({ event: 'keep_alive', status: 'ok' });
  await log.flush();
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
