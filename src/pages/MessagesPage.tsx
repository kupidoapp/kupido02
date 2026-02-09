import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, type User, type Match, type Message } from '@/lib/supabase';
import { toast } from 'sonner';

interface Conversation {
  match: Match;
  otherUser: User;
  lastMessage?: Message;
  unreadCount: number;
}

export const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        // Fetch all matches
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select('*')
          .contains('users', [user.id])
          .order('created_at', { ascending: false });

        if (matchesError) throw matchesError;

        const otherUserIds = (matchesData || [])
          .map((match) => match.users.find((id: string) => id !== user.id))
          .filter((id): id is string => Boolean(id));

        if (otherUserIds.length === 0) {
          setConversations([]);
          return;
        }

        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .in('id', otherUserIds);

        if (usersError) throw usersError;

        const usersById = new Map((usersData || []).map((profile) => [profile.id, profile]));

        const conversationsResolved = await Promise.all((matchesData || []).map(async (match): Promise<Conversation | null> => {
          const otherUserId = match.users.find((id: string) => id !== user.id);
          if (!otherUserId) return null;

          const otherUser = usersById.get(otherUserId);
          if (!otherUser) return null;

          // Fetch last message
          const { data: messagesData } = await supabase
            .from('messages')
            .select('*')
            .eq('match_id', match.id)
            .order('created_at', { ascending: false })
            .limit(1);

          // Count unread messages
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('match_id', match.id)
            .neq('sender', user.id)
            .is('read_at', null);

          return {
            match,
            otherUser,
            lastMessage: messagesData?.[0] ?? undefined,
            unreadCount: unreadCount || 0,
          };
        }));

        const conversationsList: Conversation[] = conversationsResolved.filter(
          (conversation): conversation is Conversation => conversation !== null,
        );

        // Sort by last message date
        conversationsList.sort((a, b) => {
          const dateA = a.lastMessage?.created_at || a.match.created_at;
          const dateB = b.lastMessage?.created_at || b.match.created_at;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });

        setConversations(conversationsList);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast.error('Erro ao carregar conversas');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Subscribe to new messages
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const filteredConversations = conversations.filter((conv) =>
    conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: string) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return messageDate.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-pink animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <h1 className="text-2xl font-bold text-white mb-4">Mensagens</h1>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-kupido-text-muted" />
          <input
            type="text"
            placeholder="Buscar conversas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-kupido-input text-white placeholder-kupido-text-muted border-transparent focus:border-pink focus:ring-pink/20 outline-none"
          />
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center px-8">
            <div className="w-20 h-20 bg-kupido-card rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-pink" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Nenhuma conversa ainda
            </h2>
            <p className="text-kupido-text-secondary">
              Quando você fizer um match, as conversas aparecerão aqui!
            </p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <p className="text-kupido-text-secondary">
              Nenhuma conversa encontrada para "{searchQuery}"
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.match.id}
                onClick={() => navigate(`/chat/${conversation.match.id}`)}
                className="flex items-center gap-4 p-4 hover:bg-kupido-card/50 transition-colors cursor-pointer"
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-kupido-input">
                    <img
                      src={conversation.otherUser.photos[0] || '/placeholder.jpg'}
                      alt={conversation.otherUser.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 gradient-bg rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {conversation.unreadCount}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-white truncate">
                      {conversation.otherUser.name}
                    </h3>
                    {conversation.lastMessage && (
                      <span className="text-xs text-kupido-text-muted flex-shrink-0">
                        {formatTime(conversation.lastMessage.created_at)}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm truncate ${
                    conversation.unreadCount > 0
                      ? 'text-white font-medium'
                      : 'text-kupido-text-secondary'
                  }`}>
                    {conversation.lastMessage
                      ? conversation.lastMessage.sender === user?.id
                        ? `Você: ${conversation.lastMessage.text}`
                        : conversation.lastMessage.text
                      : 'Nenhuma mensagem ainda'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
