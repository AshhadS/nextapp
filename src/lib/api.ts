export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },

    register: async (email: string, password: string) => {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', email, password }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },

    logout: async () => {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
  },

  users: {
    get: async () => {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
  },

  messages: {
    get: async (recipientId?: string) => {
      const url = recipientId 
        ? `/api/messages?recipientId=${recipientId}`
        : '/api/messages';
      const res = await fetch(url);
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },

    send: async (content: string, recipientId?: string, imageUrl?: string) => {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, recipientId, imageUrl }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
  },

  typing: {
    update: async (isTyping: boolean) => {
      const res = await fetch('/api/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTyping }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
  },

  upload: {
    image: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
  },
};
