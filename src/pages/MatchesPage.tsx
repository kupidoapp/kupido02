import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Search, Loader2, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, type User, type Match } from '@/lib/supabase';
import { toast } from 'sonner';

interface MatchWithUser extends Match {
  otherUser: User;
}

export const MatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchMatches = async () => {
      try {
        const { data: matchesData, error } = await supabase
          .from('matches')
          .select('*')
          .contains('users', [user.id])
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch user details for each match
        const matchesWithUsers: MatchWithUser[] = [];
        for (const match of matchesData || []) {
          const otherUserId = match.users.find((id: string) => id !== user.id);
          if (otherUserId) {
            const { data: userData } = await supabase
              .from('users')
              .select('*')
              .eq('id', otherUserId)
              .single();

            if (userData) {
              matchesWithUsers.push({ ...match, otherUser: userData });
            }
          }
        }

        setMatches(matchesWithUsers);
      } catch (error) {
        console.error('Error fetching matches:', error);
        toast.error('Erro ao carregar matches');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();

    // Subscribe to new matches
    const subscription = supabase
      .channel('matches')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'matches',
        filter: `users=cs.{${user.id}}`,
      }, () => {
        fetchMatches();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const filteredMatches = matches.filter((match) =>
    match.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <h1 className="text-2xl font-bold text-white mb-4">Matches</h1>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-kupido-text-muted" />
          <input
            type="text"
            placeholder="Buscar matches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-kupido-input text-white placeholder-kupido-text-muted border-transparent focus:border-pink focus:ring-pink/20 outline-none"
          />
        </div>
      </div>

      {/* Matches grid */}
      <div className="flex-1 p-4">
        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <div className="w-20 h-20 bg-kupido-card rounded-full flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-pink" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Nenhum match ainda
            </h2>
            <p className="text-kupido-text-secondary max-w-xs">
              Continue curtindo perfis no radar para encontrar seu match perfeito!
            </p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <p className="text-kupido-text-secondary">
              Nenhum match encontrado para "{searchQuery}"
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredMatches.map((match) => (
              <div
                key={match.id}
                onClick={() => navigate(`/chat/${match.id}`)}
                className="relative group cursor-pointer"
              >
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-kupido-card">
                  <img
                    src={match.otherUser.photos[0] || '/placeholder.jpg'}
                    alt={match.otherUser.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-kupido-bg/90 via-transparent to-transparent" />
                  
                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="font-semibold text-white text-sm">
                      {match.otherUser.name}, {match.otherUser.age}
                    </h3>
                    {match.otherUser.city && (
                      <p className="text-xs text-kupido-text-secondary">
                        {match.otherUser.city}
                      </p>
                    )}
                  </div>

                  {/* Message button */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchesPage;
