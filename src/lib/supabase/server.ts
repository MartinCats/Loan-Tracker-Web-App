type SupabaseServerPlaceholder = {
  isConfigured: boolean;
  runtime: "server";
};

export function getSupabaseServerClient(): SupabaseServerPlaceholder {
  return {
    isConfigured: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
    runtime: "server",
  };
}
