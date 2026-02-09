import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Edit2, MapPin, Briefcase, GraduationCap,
  Ruler, Heart, Star, Cigarette, Wine,
  Languages, Upload, X, Check
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const INTERESTS_LIST = [
  'Música', 'Viagens', 'Cinema', 'Esportes', 'Leitura', 'Cozinha',
  'Fotografia', 'Arte', 'Dança', 'Natureza', 'Tecnologia', 'Games',
  'Yoga', 'Corrida', 'Praia', 'Montanha', 'Animais', 'Voluntariado'
];

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editData, setEditData] = useState({
    bio: user?.bio || '',
    occupation: user?.occupation || '',
    education_course: user?.education_course || '',
    height: user?.height || '',
    religion: user?.religion || '',
    zodiac: user?.zodiac || '',
    smoke: user?.smoke || 'Não',
    drink: user?.drink || 'Não',
    languages: user?.languages || '',
    interests: user?.interests || [],
  });

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await updateUser(editData);
    if (error) {
      toast.error('Erro ao salvar alterações');
    } else {
      toast.success('Perfil atualizado!');
      setIsEditing(false);
    }
    setLoading(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, file);

    if (uploadError) {
      toast.error('Erro ao fazer upload da foto');
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName);

    const newPhotos = [...user.photos, publicUrl];
    await updateUser({ photos: newPhotos });
    toast.success('Foto adicionada!');
  };

  const removePhoto = async (index: number) => {
    const newPhotos = user.photos.filter((_, i) => i !== index);
    await updateUser({ photos: newPhotos });
    toast.success('Foto removida!');
  };

  const toggleInterest = (interest: string) => {
    const current = editData.interests;
    const updated = current.includes(interest)
      ? current.filter((i) => i !== interest)
      : [...current, interest];
    setEditData({ ...editData, interests: updated });
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header with cover */}
      <div className="relative">
        {/* Cover gradient */}
        <div className="h-32 gradient-bg" />

        {/* Profile info */}
        <div className="px-4 pb-4">
          <div className="relative -mt-16 mb-4 flex justify-between items-end">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-kupido-bg overflow-hidden bg-kupido-card">
                <img
                  src={user.photos[0] || '/placeholder.jpg'}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {user.is_verified && (
                <div className="absolute bottom-1 right-1 w-8 h-8 bg-kupido-success rounded-full flex items-center justify-center border-4 border-kupido-bg">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            <div className="flex gap-2 mb-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    size="sm"
                    className="border-kupido-input text-kupido-text-secondary"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    size="sm"
                    className="gradient-bg text-white"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Salvar
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                  className="border-kupido-input text-kupido-text-secondary hover:text-white"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Editar
                </Button>
              )}
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">{user.name}, {user.age}</h1>
            <div className="flex items-center gap-2 text-kupido-text-secondary text-sm mt-1">
              <MapPin className="w-4 h-4" />
              {user.city}, {user.province}
            </div>
          </div>
        </div>
      </div>

      {/* Photos */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold text-white mb-3">Fotos</h2>
        <div className="grid grid-cols-3 gap-2">
          {user.photos.map((photo, index) => (
            <div key={index} className="relative aspect-square rounded-xl overflow-hidden">
              <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
              {isEditing && (
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-kupido-error rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          ))}
          {user.photos.length < 6 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-kupido-input flex flex-col items-center justify-center gap-1 text-kupido-text-muted hover:border-pink hover:text-pink transition-colors"
            >
              <Upload className="w-6 h-6" />
              <span className="text-xs">Adicionar</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />
      </div>

      {/* Bio */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold text-white mb-3">Sobre mim</h2>
        {isEditing ? (
          <textarea
            value={editData.bio}
            onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
            placeholder="Conte um pouco sobre você..."
            className="w-full p-3 rounded-xl bg-kupido-input text-white placeholder-kupido-text-muted border-transparent focus:border-pink focus:ring-pink/20 outline-none resize-none min-h-[100px]"
            maxLength={500}
          />
        ) : (
          <p className="text-kupido-text-secondary">
            {user.bio || 'Nenhuma bio adicionada ainda.'}
          </p>
        )}
      </div>

      {/* Interests */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold text-white mb-3">Interesses</h2>
        {isEditing ? (
          <div className="flex flex-wrap gap-2">
            {INTERESTS_LIST.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
                  editData.interests.includes(interest)
                    ? 'gradient-bg text-white'
                    : 'bg-kupido-input text-kupido-text-secondary hover:bg-kupido-card'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {user.interests?.length > 0 ? (
              user.interests.map((interest, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-pink/20 text-pink text-sm rounded-full"
                >
                  {interest}
                </span>
              ))
            ) : (
              <p className="text-kupido-text-secondary text-sm">Nenhum interesse adicionado.</p>
            )}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold text-white mb-3">Detalhes</h2>
        <div className="grid grid-cols-2 gap-3">
          <DetailItem
            icon={<Briefcase className="w-4 h-4" />}
            label="Profissão"
            value={user.occupation}
            isEditing={isEditing}
            editValue={editData.occupation}
            onEdit={(v) => setEditData({ ...editData, occupation: v })}
          />
          <DetailItem
            icon={<GraduationCap className="w-4 h-4" />}
            label="Educação"
            value={user.education_course}
            isEditing={isEditing}
            editValue={editData.education_course}
            onEdit={(v) => setEditData({ ...editData, education_course: v })}
          />
          <DetailItem
            icon={<Ruler className="w-4 h-4" />}
            label="Altura"
            value={user.height}
            isEditing={isEditing}
            editValue={editData.height}
            onEdit={(v) => setEditData({ ...editData, height: v })}
          />
          <DetailItem
            icon={<Star className="w-4 h-4" />}
            label="Signo"
            value={user.zodiac}
            isEditing={isEditing}
            editValue={editData.zodiac}
            onEdit={(v) => setEditData({ ...editData, zodiac: v })}
          />
          <DetailItem
            icon={<Cigarette className="w-4 h-4" />}
            label="Fuma"
            value={user.smoke}
            isEditing={isEditing}
            editValue={editData.smoke}
            onEdit={(v) => setEditData({ ...editData, smoke: v })}
          />
          <DetailItem
            icon={<Wine className="w-4 h-4" />}
            label="Bebe"
            value={user.drink}
            isEditing={isEditing}
            editValue={editData.drink}
            onEdit={(v) => setEditData({ ...editData, drink: v })}
          />
          <DetailItem
            icon={<Languages className="w-4 h-4" />}
            label="Idiomas"
            value={user.languages}
            isEditing={isEditing}
            editValue={editData.languages}
            onEdit={(v) => setEditData({ ...editData, languages: v })}
          />
          <DetailItem
            icon={<Heart className="w-4 h-4" />}
            label="Procurando"
            value={user.looking_for}
            isEditing={false}
          />
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 pb-8">
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full border-kupido-error text-kupido-error hover:bg-kupido-error hover:text-white"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair da conta
        </Button>
      </div>
    </div>
  );
};

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  isEditing: boolean;
  editValue?: string;
  onEdit?: (value: string) => void;
}

const DetailItem: React.FC<DetailItemProps> = ({
  icon,
  label,
  value,
  isEditing,
  editValue,
  onEdit,
}) => {
  if (isEditing && onEdit) {
    return (
      <div className="bg-kupido-card rounded-xl p-3">
        <div className="flex items-center gap-2 text-kupido-text-muted text-xs mb-1">
          {icon}
          {label}
        </div>
        <input
          type="text"
          value={editValue || ''}
          onChange={(e) => onEdit(e.target.value)}
          placeholder="-"
          className="w-full bg-transparent text-white text-sm outline-none"
        />
      </div>
    );
  }

  return (
    <div className="bg-kupido-card rounded-xl p-3">
      <div className="flex items-center gap-2 text-kupido-text-muted text-xs mb-1">
        {icon}
        {label}
      </div>
      <p className="text-white text-sm">{value || '-'}</p>
    </div>
  );
};

export default ProfilePage;
