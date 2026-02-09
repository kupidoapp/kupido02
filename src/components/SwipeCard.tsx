import React, { useState, useRef, useCallback } from 'react';
import { Heart, X, MapPin, Briefcase, GraduationCap, Star, Info } from 'lucide-react';
import type { User } from '@/lib/supabase';

interface SwipeCardProps {
  user: User;
  onSwipe: (direction: 'left' | 'right' | 'super') => void;
  isTop: boolean;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ user, onSwipe, isTop }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isTop) return;
    isDragging.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startPos.current = { x: clientX, y: clientY };
  }, [isTop]);

  const handleTouchMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging.current || !isTop) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;
    
    setPosition({ x: deltaX, y: deltaY });
    setRotation(deltaX * 0.05);
  }, [isTop]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const threshold = 100;
    
    if (position.x > threshold) {
      onSwipe('right');
    } else if (position.x < -threshold) {
      onSwipe('left');
    } else {
      setPosition({ x: 0, y: 0 });
      setRotation(0);
    }
  }, [position.x, onSwipe]);

  const handleButtonSwipe = (direction: 'left' | 'right' | 'super') => {
    if (direction === 'left') {
      setPosition({ x: -500, y: 0 });
      setRotation(-30);
    } else if (direction === 'right') {
      setPosition({ x: 500, y: 0 });
      setRotation(30);
    }
    setTimeout(() => onSwipe(direction), 300);
  };

  const getLikeOpacity = () => {
    if (position.x > 0) return Math.min(position.x / 100, 1);
    return 0;
  };

  const getNopeOpacity = () => {
    if (position.x < 0) return Math.min(Math.abs(position.x) / 100, 1);
    return 0;
  };

  const cardStyle = {
    transform: `translateX(${position.x}px) translateY(${position.y}px) rotate(${rotation}deg)`,
    transition: isDragging.current ? 'none' : 'transform 0.3s ease-out',
    zIndex: isTop ? 10 : 1,
    scale: isTop ? 1 : 0.95,
  };

  return (
    <div
      ref={cardRef}
      className="absolute inset-0 swipe-card"
      style={cardStyle}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      <div className="relative w-full h-full bg-kupido-card rounded-2xl overflow-hidden card-shadow">
        {/* Image */}
        <div className="relative w-full h-full">
          <img
            src={user.photos[0] || '/placeholder.jpg'}
            alt={user.name}
            className="w-full h-full object-cover"
            draggable={false}
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-kupido-bg via-transparent to-transparent" />
          
          {/* Like/Nope stamps */}
          <div
            className="absolute top-8 right-8 border-4 border-green-500 rounded-xl px-4 py-2 transform rotate-12"
            style={{ opacity: getLikeOpacity() }}
          >
            <span className="text-3xl font-bold text-green-500 uppercase tracking-wider">LIKE</span>
          </div>
          <div
            className="absolute top-8 left-8 border-4 border-kupido-error rounded-xl px-4 py-2 transform -rotate-12"
            style={{ opacity: getNopeOpacity() }}
          >
            <span className="text-3xl font-bold text-kupido-error uppercase tracking-wider">NOPE</span>
          </div>

          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-white">{user.name}, {user.age}</h2>
                  {user.is_verified && (
                    <div className="w-5 h-5 bg-kupido-success rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-kupido-text-secondary text-sm mb-2">
                  {user.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {user.city}, {user.province}
                    </span>
                  )}
                </div>

                {showDetails && (
                  <div className="space-y-2 mt-4 slide-up">
                    {user.occupation && (
                      <span className="flex items-center gap-2 text-kupido-text-secondary text-sm">
                        <Briefcase className="w-4 h-4" />
                        {user.occupation}
                      </span>
                    )}
                    {user.education_course && (
                      <span className="flex items-center gap-2 text-kupido-text-secondary text-sm">
                        <GraduationCap className="w-4 h-4" />
                        {user.education_course}
                      </span>
                    )}
                    {user.bio && (
                      <p className="text-white text-sm mt-3 line-clamp-3">{user.bio}</p>
                    )}
                    {user.interests && user.interests.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {user.interests.map((interest, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-pink/20 text-pink text-xs rounded-full"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <Info className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {isTop && (
        <div className="absolute -bottom-20 left-0 right-0 flex justify-center gap-4">
          <button
            onClick={() => handleButtonSwipe('left')}
            className="w-14 h-14 bg-kupido-card rounded-full flex items-center justify-center text-kupido-error hover:bg-kupido-error hover:text-white transition-all duration-200 hover:scale-110 shadow-lg"
          >
            <X className="w-7 h-7" />
          </button>
          <button
            onClick={() => handleButtonSwipe('super')}
            className="w-12 h-12 bg-kupido-card rounded-full flex items-center justify-center text-kupido-purple hover:bg-kupido-purple hover:text-white transition-all duration-200 hover:scale-110 shadow-lg"
          >
            <Star className="w-6 h-6" />
          </button>
          <button
            onClick={() => handleButtonSwipe('right')}
            className="w-14 h-14 bg-kupido-card rounded-full flex items-center justify-center text-pink hover:bg-pink hover:text-white transition-all duration-200 hover:scale-110 shadow-lg"
          >
            <Heart className="w-7 h-7" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SwipeCard;
