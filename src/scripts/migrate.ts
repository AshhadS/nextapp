import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables:', {
    'NEXT_PUBLIC_SUPABASE_URL': supabaseUrl ? '✓' : '✗',
    'SUPABASE_SERVICE_ROLE_KEY': supabaseServiceKey ? '✓' : '✗'
  });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrations() {
  try {
    // Read and execute the direct-messages.sql file
    const sql = fs.readFileSync(path.join(process.cwd(), 'direct-messages.sql'), 'utf-8');
    
    // Split the SQL file into separate statements
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    console.log('Running migrations...');
    for (const statement of statements) {      if (statement.trim()) {
        const { error } = await supabase.sql(statement.trim());
        if (error) throw error;
      }
    }
    console.log('Migrations completed successfully');

    // Check for users without profiles and create them
    console.log('Checking for users without profiles...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) throw usersError;

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id');
    if (profilesError) throw profilesError;

    const existingProfileIds = new Set(profiles.map(p => p.id));
    const usersWithoutProfiles = users.users.filter(u => !existingProfileIds.has(u.id));

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
      
      if (insertError) throw insertError;
      console.log('Created missing profiles successfully');
    } else {
      console.log('All users have profiles');
    }

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
