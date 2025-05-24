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
  activity1: 'Media' | 'KF' | 'SportEX' | 'SportIN' | null;
  activity2: 'Media' | 'KF' | 'SportEX' | 'SportIN' | null;
  visible: boolean;
  created_at?: string;
}

// Function to create a new number in the database
export const createNumber = async (number: string, page: number) => {
  const { data, error } = await supabase
    .from('numbers')
    .insert([{ number, page }]);
  
  return { data, error };
};

// Function to update a number's activity1
export const updateActivity1 = async (id: number, activity1: 'Media' | 'KF' | 'SportEX' | 'SportIN') => {
  const { data, error } = await supabase
    .from('numbers')
    .update({ activity1 })
    .eq('id', id);
  
  return { data, error };
};

// Function to update a number's activity2
export const updateActivity2 = async (id: number, activity2: 'Media' | 'KF' | 'SportEX' | 'SportIN') => {
  const { data, error } = await supabase
    .from('numbers')
    .update({ activity2 })
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

// Function to set visibility for a number
export const updateNumberVisibility = async (id: number, visible: boolean) => {
  const { data, error } = await supabase
    .from('numbers')
    .update({ visible })
    .eq('id', id);
  
  return { data, error };
};

// Function to update visibility for multiple numbers
export const updatePageVisibility = async (page: number, count: number) => {
  // First, get all numbers for this page
  const { data, error } = await supabase
    .from('numbers')
    .select('id, number')
    .eq('page', page)
    .order('number', { ascending: true });
  
  if (error || !data) {
    return { data: null, error };
  }
  
  // Set visibility for each number based on count
  const updatePromises = data.map((number, index) => {
    return supabase
      .from('numbers')
      .update({ visible: index < count })
      .eq('id', number.id);
  });
  
  await Promise.all(updatePromises);
  
  return { data, error: null };
};

// Function to get page visibility count
export const getPageVisibilityCount = async (page: number) => {
  const { data, error } = await supabase
    .from('numbers')
    .select('id')
    .eq('page', page)
    .eq('visible', true);
  
  return { count: data ? data.length : 0, error };
};

// Function to get activity visibility settings for a specific page
export const getPageActivityVisibility = async (page: number) => {
  const { data, error } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', [`page${page}_activity1Enabled`, `page${page}_activity2Enabled`]);

  const settings: {[key: string]: boolean} = {
    activity1Enabled: true,
    activity2Enabled: true
  };

  if (data && !error) {
    data.forEach(item => {
      if (item.key === `page${page}_activity1Enabled`) {
        settings.activity1Enabled = item.value === 'true';
      } else if (item.key === `page${page}_activity2Enabled`) {
        settings.activity2Enabled = item.value === 'true';
      }
    });
  }
  
  return { settings, error };
};

// Function to update activity visibility settings for a specific page
export const updatePageActivityVisibility = async (page: number, activity1Enabled: boolean, activity2Enabled: boolean) => {
  // Using upsert to create if it doesn't exist
  const updates = [
    { key: `page${page}_activity1Enabled`, value: String(activity1Enabled) },
    { key: `page${page}_activity2Enabled`, value: String(activity2Enabled) }
  ];

  const { data, error } = await supabase
    .from('settings')
    .upsert(updates, { onConflict: 'key' });

  return { data, error };
};

// Function to clear all activities
export const clearAllActivities = async () => {
  const { data, error } = await supabase
    .from('numbers')
    .update({ activity1: null, activity2: null })
    .or('activity1.not.is.null,activity2.not.is.null');
  
  return { data, error };
};

// Function to get all numbers data across all pages
export const getAllNumbers = async () => {
  const { data, error } = await supabase
    .from('numbers')
    .select('*')
    .order('number', { ascending: true });
  
  return { data: data as NumberRecord[] | null, error };
};
