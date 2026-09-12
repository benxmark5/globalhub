// game-server.js
// Aviator Game Orchestrator - Runs the game loop continuously
// Usage: node game-server.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables. Check .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Game configuration
const BETTING_SECONDS = 10;        // How long players can bet
const TICK_INTERVAL_MS = 100;      // How often to update multiplier (100ms = 10 ticks/sec)
const GROWTH_RATE = 0.17;          // Exponential growth rate (matches frontend)
const SETTLE_DELAY_MS = 3000;      // Pause after crash before next round

let running = false;

// ─── Helper: Sleep ───
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Helper: Get current round ───
async function getCurrentRound() {
  const { data, error } = await supabase
    .from('game_rounds')
    .select('*')
    .in('status', ['betting', 'running'])
    .order('round_number', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) {
    console.error('❌ Error fetching round:', error.message);
    return null;
  }
  return data;
}

// ─── Helper: Create new betting round ───
async function createNewRound() {
  console.log('🎲 Opening new betting round...');
  
  const { data, error } = await supabase.rpc('open_new_betting_round', {
    p_betting_seconds: BETTING_SECONDS,
  });

  if (error) {
    console.error('❌ Error creating round:', error.message);
    return null;
  }
  
  console.log('✅ New round created. Round ID:', data[0]?.v_id);
  return data;
}

// ─── Helper: Start the round (betting → running) ───
async function startRound(roundId) {
  console.log('🚀 Starting round:', roundId);
  
  const now = new Date().toISOString();
  
  const { error } = await supabase
    .from('game_rounds')
    .update({ 
      status: 'running', 
      running_started_at: now,
      multiplier: 1.0,
    })
    .eq('id', roundId)
    .eq('status', 'betting'); // Only if still betting (safety check)

  if (error) {
    console.error('❌ Error starting round:', error.message);
    return false;
  }
  return true;
}

// ─── Helper: Crash and settle round ───
async function crashRound(roundId) {
  console.log('💥 Crashing round:', roundId);
  
  const { data, error } = await supabase.rpc('crash_and_settle_round', {
    p_round_id: roundId,
  });

  if (error) {
    console.error('❌ Error settling round:', error.message);
    return false;
  }
  
  console.log('✅ Round settled. Results:', data);
  return true;
}

// ─── Helper: Update multiplier ───
async function updateMultiplier(roundId, multiplier) {
  const { error } = await supabase
    .from('game_rounds')
    .update({ multiplier })
    .eq('id', roundId)
    .eq('status', 'running');

  if (error) {
    console.error('❌ Error updating multiplier:', error.message);
    return false;
  }
  return true;
}

// ─── Main Game Loop ───
async function gameLoop() {
  if (running) return;
  running = true;

  console.log('🎮 Game server started. Press Ctrl+C to stop.');

  while (true) {
    try {
      // 1. Check if there's an active round
      const currentRound = await getCurrentRound();

      if (!currentRound) {
        // No active round — create one
        await createNewRound();
        await sleep(1000);
        continue;
      }

      // 2. If betting phase
      if (currentRound.status === 'betting') {
        const bettingEndsAt = new Date(currentRound.betting_ends_at).getTime();
        const now = Date.now();

        if (now >= bettingEndsAt) {
          // Time to start the round
          await startRound(currentRound.id);
          console.log('🛫 Round is now flying!');
        } else {
          // Still in betting phase — wait 1 second
          const secondsLeft = Math.ceil((bettingEndsAt - now) / 1000);
          console.log(`⏳ Betting closes in ${secondsLeft}s...`);
          await sleep(1000);
        }
        continue;
      }

      // 3. If running phase
      if (currentRound.status === 'running') {
        const runningStartedAt = new Date(currentRound.running_started_at).getTime();
        const elapsedSeconds = (Date.now() - runningStartedAt) / 1000;
        const currentMultiplier = Math.exp(GROWTH_RATE * elapsedSeconds);
        const crashPoint = Number(currentRound.crash_point);

        // Check if we should crash
        if (currentMultiplier >= crashPoint) {
          console.log(`💥 CRASH! Multiplier: ${currentMultiplier.toFixed(2)}x, Crash Point: ${crashPoint.toFixed(2)}x`);
          
          // Set final multiplier
          await updateMultiplier(currentRound.id, crashPoint);
          
          // Settle the round
          await crashRound(currentRound.id);
          
          // Pause before next round
          console.log(`⏸️ Waiting ${SETTLE_DELAY_MS / 1000}s before next round...`);
          await sleep(SETTLE_DELAY_MS);
        } else {
          // Update multiplier
          await updateMultiplier(currentRound.id, Number(currentMultiplier.toFixed(4)));
          
          // Log every second
          if (Math.floor(elapsedSeconds) !== Math.floor(elapsedSeconds - 0.1)) {
            console.log(`✈️ Flying: ${currentMultiplier.toFixed(2)}x`);
          }
          
          // Wait for next tick
          await sleep(TICK_INTERVAL_MS);
        }
        continue;
      }

      // 4. No recognized state — wait
      await sleep(1000);

    } catch (err) {
      console.error('❌ Game loop error:', err.message);
      await sleep(2000);
    }
  }
}

// ─── Start ───
gameLoop().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});