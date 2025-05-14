'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { LoadingButton } from '@/components/LoadingButton';
import { MessageForm } from '@/components/MessageForm';

interface Message {
  id: number;
  created_at: string;
  content: string;
  user_id: string;
  user_email: string;
  image_url?: string;
}

interface TypingStatus {
  id: string;
  is_typing: boolean;
  user_email: string;
}

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<any>(null);
  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkUser();
    fetchMessages().finally(() => setIsLoading(false));
    const channel = supabase.channel('room1');
    
    channel
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        payload => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'typing_status' },
        payload => {
          const typingStatus = payload.new as TypingStatus;
          setTypingUsers(prev => {
            const filtered = prev.filter(u => u.id !== typingStatus.id);
            if (typingStatus.is_typing) {
              return [...filtered, typingStatus];
            }
            return filtered;
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (user) {
        api.typing.update(false).catch(error => {
          console.error('Error clearing typing status:', error);
        });
      }
    };
  }, [user]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
    } else {
      setUser(user);
      try {
        const { error } = await supabase
          .from('typing_status')
          .upsert({
            id: user.id,
            is_typing: false,
            user_email: user.email
          });
        if (error) console.error('Error initializing typing status:', error);
      } catch (error) {
        console.error('Error initializing typing status:', error);
      }
    }
  };

  const fetchMessages = async () => {
    try {
      const { messages } = await api.messages.get();
      setMessages(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      if (user) {
        await api.typing.update(false);
      }
      await api.auth.logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleUpdateTyping = async (isTyping: boolean) => {
    if (!user) return;
    try {
      await api.typing.update(isTyping);
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Chat Room</h1>
          <LoadingButton
            type="button"
            onClick={handleSignOut}
            isLoading={isSigningOut}
            text="Sign Out"
            loadingText="Signing out..."
            className="px-4 py-2 text-sm text-red-600 hover:text-red-900"
          />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              {typingUsers.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-500 p-2 bg-gray-50 rounded-lg">
                  <div className="flex space-x-1">
                    <span className="animate-bounce">•</span>
                    <span className="animate-bounce [animation-delay:0.2s]">•</span>
                    <span className="animate-bounce [animation-delay:0.4s]">•</span>
                  </div>
                  <span className="italic">
                    {typingUsers
                      .filter(u => u.user_email !== user?.email)
                      .map(u => u.user_email)
                      .join(', ')}{' '}
                    {typingUsers.length === 1 ? 'is' : 'are'} typing...
                  </span>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg ${
                    message.user_id === user?.id
                      ? 'bg-blue-500 text-white ml-auto'
                      : 'bg-green-100 text-gray-800 mr-auto'
                  } max-w-md`}
                >
                  <div className="text-sm opacity-75">
                    {message.user_email}
                  </div>
                  {message.content && <div>{message.content}</div>}
                  {message.image_url && (
                    <div className="mt-2">
                      <img
                        src={message.image_url}
                        alt="Shared image"
                        className="rounded-lg max-w-full h-auto"
                        style={{ maxHeight: '300px' }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </main>

      <footer className="bg-white p-4 shadow-lg">
        <MessageForm user={user} onUpdateTyping={handleUpdateTyping} />
      </footer>
    </div>
  );
}
