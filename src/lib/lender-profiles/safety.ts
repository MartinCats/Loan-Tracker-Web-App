import type { LenderProfile } from "@/lib/lender-profiles/types";

export function getEarliestProfile(profiles: LenderProfile[]) {
  return [...profiles].sort((a, b) => {
    const createdAtOrder = a.createdAt.localeCompare(b.createdAt);
    return createdAtOrder === 0 ? a.id.localeCompare(b.id) : createdAtOrder;
  })[0] ?? null;
}

export function resolveActiveProfile(
  profiles: LenderProfile[],
  activeProfileId?: string | null,
) {
  if (activeProfileId) {
    const activeProfile = profiles.find(
      (profile) => profile.id === activeProfileId,
    );

    if (activeProfile) {
      return activeProfile;
    }
  }

  return getEarliestProfile(profiles);
}

export function canDeleteProfile(profileCount: number) {
  return profileCount > 1;
}

export function shouldResetActiveProfileAfterDelete(
  deletedProfileId: string,
  activeProfileId?: string | null,
) {
  return Boolean(activeProfileId && deletedProfileId === activeProfileId);
}
