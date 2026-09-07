/**
 * Supabase Client Configuration & Initialization
 * SMAPSI Gallery Website
 */

// Ganti URL dan Anon Key dengan kredensial dari Dashboard Supabase Anda (Project Settings > API)
const SUPABASE_URL = window.SUPABASE_URL || 'https://luztwjzplcvtoalyqehm.supabase.co';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'sb_publishable_O24Q9sf5qwgbNjDZRJPdZQ_pWGfg8tP';

// Inisialisasi Supabase Client
let supabaseClient = null;

if (typeof supabase !== 'undefined' && supabase.createClient) {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('✅ Supabase Client terinisialisasi secara aman.');
} else {
  console.warn('⚠️ Supabase SDK belum dimuat via CDN, menggunakan mode simpul terisolasi.');
}

window.supabaseClient = supabaseClient;
