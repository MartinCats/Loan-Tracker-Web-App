import { cookies } from "next/headers";

export const activeLenderProfileCookieName = "active_lender_profile_id";

export async function getActiveLenderProfileIdFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(activeLenderProfileCookieName)?.value;
}

export async function clearActiveLenderProfileIdCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(activeLenderProfileCookieName);
}

export async function setActiveLenderProfileIdCookie(profileId: string) {
  const cookieStore = await cookies();

  cookieStore.set(activeLenderProfileCookieName, profileId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
