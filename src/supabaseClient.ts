import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase URL and anon key
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define table type for numbers
export interface NumberRecord {
  id: number;
  number: string;
  page: number;
  status: 'Media' | 'Cafe' | 'Sport EXT' | 'Sport INT' | null;
  created_at?: string;
}

// Function to create a new number in the database
export const createNumber = async (number: string, page: number) => {
  const { data, error } = await supabase
    .from('numbers')
    .insert([{ number, page }]);
  
  return { data, error };
};

// Function to update a number's status
export const updateNumberStatus = async (id: number, status: 'Media' | 'Cafe' | 'Sport EXT' | 'Sport INT') => {
  const { data, error } = await supabase
    .from('numbers')
    .update({ status })
    .eq('id', id);
  
  return { data, error };
};

// Function to get all numbers by page
export const getNumbersByPage = async (page: number) => {
  const { data, error } = await supabase
    .from('numbers')
    .select('*')
    .eq('page', page)
    .order('number', { ascending: true });
  
  return { data: data as NumberRecord[] | null, error };
};

// Function to clear all statuses
export const clearAllStatuses = async () => {
  const { data, error } = await supabase
    .from('numbers')
    .update({ status: null })
    .not('status', 'is', null);
  
  return { data, error };
};
