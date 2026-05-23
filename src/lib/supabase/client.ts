type SupabasePlaceholder = {
  isConfigured: boolean;
  url?: string;
};

export function getSupabaseBrowserClient(): SupabasePlaceholder {
  return {
    isConfigured: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  };
}
