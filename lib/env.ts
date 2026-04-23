function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Server-only env used by Supabase admin + internal fetches.
 * Do not require AI keys here — those routes validate at runtime so the app shell can load without them.
 */
export const env = {
  NEXT_PUBLIC_SUPABASE_URL: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  SUPABASE_SERVICE_ROLE_KEY: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  // Optional — only needed for server-to-server opportunity generation call.
  // Falls back to localhost in development if not set.
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};
