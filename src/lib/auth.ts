// src/lib/auth.ts
'use client';

import { supabase } from './supabaseClient';

type SignUpArgs = {
  email: string;
  password: string;
  fullName: string;
  phone: string;
};

export async function signUpWithEmail({
  email,
  password,
  fullName,
  phone,
}: SignUpArgs) {
  const trimmedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password,
  });

  if (error || !data.user) {
    return { user: null, error };
  }

  const user = data.user;

  const { error: profileError } = await supabase.from('customers').insert({
    id: user.id,
    full_name: fullName.trim(),
    email: trimmedEmail,
    phone: phone.trim(),
    loyalty_points: 0,
  });

  if (profileError) {
    console.error('Failed to create customer profile:', profileError);
    return { user: null, error: profileError };
  }

  return { user, error: null };
}

export async function signInWithEmailPassword(email: string, password: string) {
  const trimmedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password,
  });

  if (error) {
    return { user: null, session: null, error };
  }

  return { user: data.user, session: data.session, error: null };
}

export async function resetPassword(email: string) {
  const trimmedEmail = email.trim().toLowerCase();

  const redirectTo =
    process.env.NEXT_PUBLIC_SUPABASE_RESET_REDIRECT_URL ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/reset-password`
      : undefined);

  const { data, error } = await supabase.auth.resetPasswordForEmail(
    trimmedEmail,
    { redirectTo },
  );

  return { data, error };
}
