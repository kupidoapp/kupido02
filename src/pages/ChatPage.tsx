import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Phone, MoreVertical, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, type User, type Message } from '@/lib/supabase';
import { toast } from 'sonner';

export const ChatPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !matchId) return;

    const fetchChatData = async () => {
      try {
        // Fetch match and other user
        const { data: matchData } = await supabase
          .from('matches')
          .select('*')
          .eq('id', matchId)
          .single();

        if (matchData) {
          const otherUserId = matchData.users.find((id: string) => id !== user.id);
          if (otherUserId) {
            const { data: userData } = await supabase
              .from('users')
              .select('*')
              .eq('id', otherUserId)
              .single();
            setOtherUser(userData);
          }
        }

        // Fetch messages
        const { data: messagesData } = await supabase
          .from('messages')
          .select('*')
          .eq('match_id', matchId)
          .order('created_at', { ascending: true });

        setMessages(messagesData || []);
      } catch (error) {
        console.error('Error fetching chat:', error);
        toast.error('Erro ao carregar conversa');
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();

    // Subscribe to new messages
    const subscription = supabase
      .channel(`messages:${matchId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, matchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !matchId) return;

    try {
      const { error } = await supabase.from('messages').insert([{
        match_id: matchId,
        sender: user.id,
        text: newMessage.trim(),
      }]);

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: string) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return messageDate.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
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

  if (!otherUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-kupido-text-secondary">Conversa não encontrada</p>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages: { [key: string]: Message[] } = {};
  messages.forEach((message) => {
    const date = new Date(message.created_at).toDateString();
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });

  return (
    <div className="min-h-screen flex flex-col bg-kupido-bg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-kupido-card border-b border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/matches')}
            className="w-10 h-10 flex items-center justify-center text-kupido-text-secondary hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div
            onClick={() => navigate(`/profile/${otherUser.id}`)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-kupido-input">
              <img
                src={otherUser.photos[0] || '/placeholder.jpg'}
                alt={otherUser.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="font-semibold text-white">{otherUser.name}</h2>
              <p className="text-xs text-kupido-text-secondary">
                {otherUser.is_verified ? 'Verificado' : 'Online'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center text-kupido-text-secondary hover:text-pink transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center text-kupido-text-secondary hover:text-white transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              É um Match! 🎉
            </h3>
            <p className="text-kupido-text-secondary text-sm max-w-xs">
              Você e {otherUser.name} curtiram um ao outro. Que tal começar uma conversa?
            </p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex justify-center mb-4">
                <span className="px-3 py-1 bg-kupido-input rounded-full text-xs text-kupido-text-muted">
                  {formatDate(dateMessages[0].created_at)}
                </span>
              </div>

              {/* Messages for this date */}
              <div className="space-y-3">
                {dateMessages.map((message) => {
                  const isMe = message.sender === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                          isMe
                            ? 'gradient-bg text-white rounded-br-md'
                            : 'bg-kupido-card text-white rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <span className={`text-xs mt-1 block ${isMe ? 'text-white/70' : 'text-kupido-text-muted'}`}>
                          {formatTime(message.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 bg-kupido-card border-t border-white/5">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Digite uma mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 px-4 py-3 rounded-full bg-kupido-input text-white placeholder-kupido-text-muted border-transparent focus:border-pink focus:ring-pink/20 outline-none"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPage;
