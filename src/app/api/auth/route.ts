import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { action, email, password } = await request.json();
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    if (action === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return NextResponse.json({ user: data.user });
    }    if (action === 'register') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      if (data.user) {
        // Create a profile for the new user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username: email.split('@')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Don't throw here as the user is already created
        }
      }
      
      return NextResponse.json({ user: data.user });
    }if (action === 'logout') {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return NextResponse.json({ success: true }, {
        headers: {
          'Set-Cookie': 'sb-access-token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT',
        }
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
