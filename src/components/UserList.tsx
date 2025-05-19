import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  username: string;
  avatar_url?: string;
}

interface UserListProps {
  currentUserId: string;
  onSelectUser: (user: User | null) => void;
  selectedUser: User | null;
}

export const UserList = ({ currentUserId, onSelectUser, selectedUser }: UserListProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.users.get();
        console.log('API Response:', response);
        if (response.users) {
          setUsers(response.users);
        } else {
          console.warn('No users returned from API');
          setUsers([]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => onSelectUser(null)}
        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
          !selectedUser
            ? 'bg-blue-100 text-blue-800'
            : 'hover:bg-gray-100'
        }`}
      >
        Public Chat
      </button>
      
      {users.length === 0 ? (
        <div className="text-center p-4 text-gray-500">
          No other users available
        </div>
      ) : (
        users.map((user) => (
          <button
            key={user.id}
            onClick={() => onSelectUser(user)}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              selectedUser?.id === user.id
                ? 'bg-blue-100 text-blue-800'
                : 'hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <span className="text-gray-500 text-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="truncate">{user.username}</span>
            </div>
          </button>
        ))
      )}
    </div>
  );
};
