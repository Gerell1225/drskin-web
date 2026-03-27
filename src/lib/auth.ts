'use client';

import { supabase } from './supabaseClient';

type SignUpArgs = {
  email: string;
  password: string;
  fullName: string;
  phone: string;
};

type EnsureCustomerArgs = {
  userId: string;
  email: string;
  fullName: string;
  phone: string;
};

async function ensureCustomerProfile({
  userId,
  email,
  fullName,
  phone,
}: EnsureCustomerArgs) {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = fullName.trim();
  const trimmedPhone = phone.trim();

  const { data: existing, error: existingError } = await supabase
    .from('customers')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (existingError) {
    return { data: null, error: existingError };
  }

  if (existing) {
    return { data: existing, error: null };
  }

  const payload = {
    id: userId,
    full_name: trimmedName,
    email: trimmedEmail,
    phone: trimmedPhone,
    loyalty_points: 0,
    total_points: 0,
    total_visits: 0,
    is_active: true,
    name: trimmedName,
  };

  const { data, error } = await supabase
    .from('customers')
    .insert(payload as any)
    .select('id')
    .single();

  return { data, error };
}

export async function signUpWithEmail({
  email,
  password,
  fullName,
  phone,
}: SignUpArgs) {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = fullName.trim();
  const trimmedPhone = phone.trim();

  const { data, error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password,
    options: {
      data: {
        full_name: trimmedName,
        phone: trimmedPhone,
      },
    },
  });

  if (error || !data.user) {
    return { user: null, session: null, error: error ?? new Error('Sign up failed') };
  }

  if (data.session) {
    const { error: profileError } = await ensureCustomerProfile({
      userId: data.user.id,
      email: trimmedEmail,
      fullName: trimmedName,
      phone: trimmedPhone,
    });

    if (profileError) {
      console.error('Failed to create customer profile after signup:', profileError);
      return { user: null, session: null, error: profileError };
    }
  }

  return { user: data.user, session: data.session, error: null };
}

export async function signInWithEmailPassword(email: string, password: string) {
  const trimmedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password,
  });

  if (error || !data.user) {
    return { user: null, session: null, error };
  }

  const user = data.user;
  const metaFullName =
    typeof user.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name.trim()
      : '';
  const metaPhone =
    typeof user.user_metadata?.phone === 'string'
      ? user.user_metadata.phone.trim()
      : '';

  if (user.email && metaPhone) {
    const safeName = metaFullName || user.email.split('@')[0] || 'Хэрэглэгч';

    const { error: profileError } = await ensureCustomerProfile({
      userId: user.id,
      email: user.email,
      fullName: safeName,
      phone: metaPhone,
    });

    if (profileError) {
      console.error('Failed to ensure customer profile after login:', profileError);
    }
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