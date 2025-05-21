import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { SupabaseClient, User } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface User {
  id: string;
  email?: string;
}

interface Profile {
  id: string;
  username: string;
  created_at: string;
  updated_at: string;
}

async function setupDatabase() {
  try {
    console.log('Setting up profiles table...');
    const { error: profilesError } = await supabase
      .from('profiles')
      .upsert([
        {
          id: '00000000-0000-0000-0000-000000000000', // Dummy row to create table
          username: 'system',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);

    if (profilesError) {
      console.error('Error creating profiles table:', profilesError);
      return;
    }

    // Get all users    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }

    // Get existing profiles
    const { data: existingProfiles, error: profilesQueryError } = await supabase
      .from('profiles')
      .select('id');
    
    if (profilesQueryError) {
      console.error('Error fetching profiles:', profilesQueryError);
      return;
    }

    const existingProfileIds = new Set(existingProfiles?.map(p => p.id) || []);
    const usersWithoutProfiles = (users as User[]).filter(u => !existingProfileIds.has(u.id));

    if (usersWithoutProfiles.length > 0) {
      console.log(`Creating profiles for ${usersWithoutProfiles.length} users...`);
      const profilesToCreate = usersWithoutProfiles.map(user => ({
        id: user.id,
        username: user.email?.split('@')[0] || `user_${user.id.substring(0, 8)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: insertError } = await supabase
        .from('profiles')
        .insert(profilesToCreate);

      if (insertError) {
        console.error('Error creating profiles:', insertError);
        return;
      }
      console.log('Created missing profiles successfully');
    } else {
      console.log('All users have profiles');
    }

  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
