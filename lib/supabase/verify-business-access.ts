import type { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * Verifies that the given user has access to the given businessId.
 * - Authenticated user must own the business (user_id = user.id)
 * - Anonymous user may only access unclaimed businesses (user_id IS NULL)
 *
 * Returns the business row on success, null on access denied or not found.
 */
export async function verifyBusinessAccess(
  adminClient: SupabaseClient,
  businessId: string,
  user: User | null
): Promise<{ id: string; user_id: string | null } | null> {
  const { data: business } = await adminClient
    .from("businesses")
    .select("id, user_id")
    .eq("id", businessId)
    .single();

  if (!business) return null;
  if (user !== null && business.user_id !== user.id) return null;
  if (user === null && business.user_id !== null) return null;

  return business;
}
