import React, { useState, useEffect, useCallback } from 'react';

import { SlidersHorizontal, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, type User } from '@/lib/supabase';
import { SwipeCard } from '@/components/SwipeCard';
import { FilterDrawer } from '@/components/FilterDrawer';
import { toast } from 'sonner';

interface Filters {
  gender: string;
  minAge: number;
  maxAge: number;
  province: string;
  lookingFor: string;
}

export const RadarPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    gender: '',
    minAge: 18,
    maxAge: 50,
    province: '',
    lookingFor: '',
  });

  const fetchUsers = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('users')
        .select('*')
        .neq('id', user.id)
        .eq('is_banned', false);

      // Apply filters
      if (filters.gender) {
        query = query.eq('gender', filters.gender);
      }
      if (filters.province) {
        query = query.eq('province', filters.province);
      }
      if (filters.lookingFor) {
        query = query.eq('looking_for', filters.lookingFor);
      }

      // Age range
      query = query.gte('age', filters.minAge).lte('age', filters.maxAge);

      // Exclude users already liked
      const { data: likes } = await supabase
        .from('likes')
        .select('to_user')
        .eq('from_user', user.id);

      const likedUserIds = likes?.map((l) => l.to_user) || [];
      if (likedUserIds.length > 0) {
        query = query.not('id', 'in', `(${likedUserIds.join(',')})`);
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;
      setUsers(data || []);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar perfis');
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSwipe = async (direction: 'left' | 'right' | 'super') => {
    if (!user || currentIndex >= users.length) return;

    const targetUser = users[currentIndex];

    if (direction === 'right' || direction === 'super') {
      try {
        // Check if it's a match
        const { data: existingLike } = await supabase
          .from('likes')
          .select('*')
          .eq('from_user', targetUser.id)
          .eq('to_user', user.id)
          .single();

        if (existingLike) {
          // It's a match!
          const matchId = [user.id, targetUser.id].sort().join('_');
          await supabase.from('matches').insert([{
            id: matchId,
            users: [user.id, targetUser.id],
          }]);

          toast.success(
            <div className="text-center">
              <p className="font-bold text-lg">É um Match! 🎉</p>
              <p className="text-sm">Você e {targetUser.name} curtiram um ao outro!</p>
            </div>,
            { duration: 4000 }
          );
        }

        // Save like
        await supabase.from('likes').insert([{
          from_user: user.id,
          to_user: targetUser.id,
        }]);
      } catch (error) {
        console.error('Error saving like:', error);
      }
    }

    setCurrentIndex((prev) => prev + 1);
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
      <div className="flex items-center justify-between p-4">
        <h1 className="text-xl font-semibold text-white">Radar</h1>
        <button
          onClick={() => setFilterOpen(true)}
          className="w-10 h-10 bg-kupido-card rounded-full flex items-center justify-center text-kupido-text-secondary hover:text-pink transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Cards container */}
      <div className="flex-1 relative px-4 pb-24">
        {currentIndex < users.length ? (
          <div className="relative w-full h-[calc(100vh-200px)] max-w-md mx-auto">
            {users.slice(currentIndex, currentIndex + 3).map((u, index) => (
              <SwipeCard
                key={u.id}
                user={u}
                onSwipe={handleSwipe}
                isTop={index === 0}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center px-8">
            <div className="w-24 h-24 bg-kupido-card rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">😔</span>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Não há mais perfis por enquanto
            </h2>
            <p className="text-kupido-text-secondary mb-6">
              Você viu todos os perfis disponíveis. Volte mais tarde!
            </p>
            <button
              onClick={fetchUsers}
              className="px-6 py-3 gradient-bg text-white font-semibold rounded-full btn-shadow hover:opacity-90 transition-opacity"
            >
              Atualizar
            </button>
          </div>
        )}
      </div>

      {/* Filter drawer */}
      <FilterDrawer
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
};

export default RadarPage;
