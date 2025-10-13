
// Environment variables
export const FLASK_API_URL = import.meta.env.VITE_FLASK_API_URL || "http://localhost:5000";
export const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === "true";

// Note: OPENAI_API_KEY is now securely managed through Supabase Edge Functions and secrets
// Do not use or reference it directly in client-side code

// Log if API keys are missing (for debugging)
if (!FLASK_API_URL) {
  console.warn("FLASK_API_URL is not set. Flask API calls will fail in production.");
}
