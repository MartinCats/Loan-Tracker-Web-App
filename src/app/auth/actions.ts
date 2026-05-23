"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  status: "idle" | "error" | "success";
  message: string;
};

const defaultRedirect = "/dashboard";

type ParsedAuthForm =
  | {
      ok: true;
      email: string;
      password: string;
      next: string;
    }
  | {
      ok: false;
      error: string;
    };

function getEmailAndPassword(formData: FormData): ParsedAuthForm {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const requestedNext = String(formData.get("next") ?? defaultRedirect);
  const next = requestedNext.startsWith("/") ? requestedNext : defaultRedirect;

  if (!email || !password) {
    return {
      ok: false,
      error: "Enter both email and password.",
    };
  }

  if (password.length < 6) {
    return {
      ok: false,
      error: "Password must be at least 6 characters.",
    };
  }

  return {
    ok: true,
    email,
    password,
    next,
  };
}

export async function signInAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const values = getEmailAndPassword(formData);

  if (!values.ok) {
    return { status: "error", message: values.error };
  }

  const supabase = await createClient();

  if (!supabase) {
    return {
      status: "error",
      message: "Supabase is not configured. Add the public URL and anon key.",
    };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  redirect(values.next);
}

export async function signUpAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const values = getEmailAndPassword(formData);

  if (!values.ok) {
    return { status: "error", message: values.error };
  }

  const supabase = await createClient();

  if (!supabase) {
    return {
      status: "error",
      message: "Supabase is not configured. Add the public URL and anon key.",
    };
  }

  const { error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  return {
    status: "success",
    message:
      "Account created. If email confirmation is enabled, confirm your email before signing in.",
  };
}

export async function signOutAction() {
  const supabase = await createClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/auth/sign-in");
}
