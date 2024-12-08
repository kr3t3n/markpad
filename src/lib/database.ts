import { supabase } from './supabase';
import type { Document } from '../types/database';

export async function createDocument(userId: string, title: string, content: string) {
  const { data, error } = await supabase
    .from('documents')
    .insert([{ user_id: userId, title, content }])
    .select()
    .single();
  
  return { data, error };
}

export async function updateDocument(id: string, updates: Partial<Omit<Document, 'id' | 'user_id'>>) {
  const { data, error } = await supabase
    .from('documents')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
}

export async function deleteDocument(id: string) {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);
  
  return { error };
}

export async function getUserDocuments(userId: string) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  
  return { data, error };
}

export async function getDocument(id: string) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
}