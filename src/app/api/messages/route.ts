import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const recipientId = url.searchParams.get('recipientId');
    const supabase = createRouteHandlerClient({ cookies });    let query = supabase
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
    const { content, imageUrl, recipientId } = await request.json();
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          content,
          user_id: user.id,
          user_email: user.email,
          image_url: imageUrl,
          recipient_id: recipientId || null,
        },
      ]);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
