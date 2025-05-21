import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const recipientId = url.searchParams.get('recipientId');
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    let query = supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (recipientId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }      query = query.or(
        `and(recipient_id.eq.${recipientId},user_id.eq.${user.id}),and(recipient_id.eq.${user.id},user_id.eq.${recipientId})`
      );
    } else {
      query = query.is('recipient_id', null);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ messages: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('Received message request');
    
    // Check content type
    const contentType = request.headers.get('content-type');
    if (contentType !== 'application/json') {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 400 });
    }

    const { content, imageUrl, recipientId } = await request.json();
    console.log('Message data:', { content, imageUrl, recipientId });
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('Authenticated as user:', user.id);

    if (!content && !imageUrl) {
      return NextResponse.json({ error: 'Message must have content or an image' }, { status: 400 });
    }

    const messageData = {
      content: content || '',
      user_id: user.id,
      user_email: user.email,
      image_url: imageUrl,
      recipient_id: recipientId || null,
    };
    console.log('Inserting message:', messageData);

    const { data, error } = await supabase
      .from('messages')
      .insert([messageData]);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
