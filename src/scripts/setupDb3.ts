import { createClient } from '@supabase/supabase-js';
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

async function setupDatabase() {
  try {
    // Read and execute the SQL setup files
    const sqlFiles = ['direct-messages.sql', 'fix-messages-schema.sql', 'typing-status.sql'];
    
    for (const filename of sqlFiles) {
      const filePath = path.join(process.cwd(), filename);
      if (fs.existsSync(filePath)) {
        console.log(`\nExecuting ${filename}...`);
        const sql = fs.readFileSync(filePath, 'utf8');
        
        // Split SQL into statements
        const statements = sql
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0);
        
        for (const stmt of statements) {
          const { error } = await supabase.rpc('execute_sql', { sql: stmt });
          if (error) {
            console.error(`Error executing statement from ${filename}:`, error);
            console.error('Statement:', stmt);
          }
        }
      }
    }

    console.log('\nVerifying database setup...');
    
    // Check if profiles table exists
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('count(*)')
      .single();
    
    if (profilesError) {
      console.error('Error verifying profiles table:', profilesError);
    } else {
      console.log('✓ Profiles table is set up correctly');
    }

    console.log('\nDatabase setup completed');
    
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
