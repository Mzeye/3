/* ============================================================
   database.js — Supabase client & CRUD operations
   ============================================================ */

const SUPABASE_URL = 'https://klkktsigjelowtiqssho.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtsa2t0c2lnamVsb3d0aXFzc2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NTE1NTgsImV4cCI6MjA5NjEyNzU1OH0.KDPBA0yLahvR3EgANiBRdYsXmi1_MgjitDzF0mKf5xc';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchEssays() {
  const { data, error } = await db
    .from('essays')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

async function saveEssay({ title, content, wordCount, charCount }) {
  const { data, error } = await db
    .from('essays')
    .insert([{
      title,
      content,
      word_count: wordCount,
      char_count: charCount
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateEssay(id, { title, content, wordCount, charCount }) {
  const { data, error } = await db
    .from('essays')
    .update({
      title,
      content,
      word_count: wordCount,
      char_count: charCount
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteEssay(id) {
  const { error } = await db
    .from('essays')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
