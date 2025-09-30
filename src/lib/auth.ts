import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'tenant' | 'landlord' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export const signUp = async (email: string, password: string, fullName: string, role: UserRole = 'tenant') => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
      emailRedirectTo: `${window.location.origin}/`,
    },
  });

  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data.role as UserRole;
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const role = await getUserRole(user.id);
  
  return {
    id: user.id,
    email: user.email!,
    role: role || 'tenant',
  };
};
