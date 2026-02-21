// Supabase Edge Function — Günlük İstatistik Aggregate
// Step 04 Performance Engine'den sonra aktif olacak

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (_req: Request) => {
  return new Response(
    JSON.stringify({ message: 'Cron Daily Stats — Step 04\'ten sonra aktif' }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
