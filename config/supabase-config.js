// Supabase Configuration
const SUPABASE_URL = 'https://sjuagjlbgwdjikktuuod.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqdWFnamxiZ3dkamlra3R1dW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5ODQxMTksImV4cCI6MjA4MjU2MDExOX0.MLbXEEWfC7RblGxfE0t6l7mIdoRxZ7NKyykjXyd8bLs';

// Initialize Supabase client
let supabase;

// Function to initialize Supabase
function initializeSupabase() {
  try {
    // Check if Supabase library is loaded
    if (typeof window.supabase === 'undefined') {
      console.error('Supabase library not loaded. Please check if the CDN script is loaded correctly.');
      return false;
    }
    
    console.log('Supabase library loaded successfully');
    console.log('Supabase version:', window.supabase.version || 'Unknown');
    
    // Initialize the client
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    if (supabase) {
      console.log('Supabase client initialized successfully');
      console.log('Auth module available:', !!supabase.auth);
      console.log('signInWithPassword method available:', !!(supabase.auth && supabase.auth.signInWithPassword));
      return true;
    } else {
      console.error('Failed to initialize Supabase client');
      return false;
    }
  } catch (error) {
    console.error('Error initializing Supabase:', error);
    return false;
  }
}

// Try to initialize immediately
if (!initializeSupabase()) {
  // If immediate initialization fails, wait for the library to load
  console.log('Retrying Supabase initialization in 1 second...');
  setTimeout(() => {
    if (!initializeSupabase()) {
      console.error('Failed to initialize Supabase after retry');
    }
  }, 1000);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { supabase, SUPABASE_URL, SUPABASE_ANON_KEY };
}