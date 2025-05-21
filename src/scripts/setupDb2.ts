import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Read environment variables from .env.local
const envFile = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
const envVars = Object.fromEntries(
  envFile.split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split('='))
);

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface Profile {
  id: string;
  username: string;
  created_at: string;
  updated_at: string;
}

async function setupDatabase() {
  try {
    // Read and execute the SQL setup files
    const files = ['direct-messages.sql', 'fix-messages-schema.sql', 'typing-status.sql'].map(
      file => path.join(process.cwd(), file)
    );

    console.log('Running SQL setup files...');
    for (const file of files) {
      if (fs.existsSync(file)) {
        const sql = fs.readFileSync(file, 'utf8');
        console.log(`Executing ${path.basename(file)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql });
        if (error) {
          console.error(`Error executing ${path.basename(file)}:`, error);
        }
      }
    }

    // Verify the profiles table
    console.log('Verifying profiles table...');
    const { error: profilesError } = await supabase.from('profiles').select('id').limit(1);
    if (profilesError) {
      console.error('Error verifying profiles table:', profilesError);
      return;
    }

    // Get existing profiles
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id');
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return;
    }

    const existingProfileIds = new Set(existingProfiles?.map(p => p.id) || []);
    const usersWithoutProfiles = users.filter(user => !existingProfileIds.has(user.id));

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
