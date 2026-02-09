import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, ChevronRight, ChevronLeft, Upload, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const PROVINCES = [
  'Maputo', 'Gaza', 'Inhambane', 'Sofala', 'Manica', 'Tete',
  'Zambezia', 'Nampula', 'Cabo Delgado', 'Niassa'
];

const GENDERS = ['Masculino', 'Feminino'];
const LOOKING_FOR = ['Namoro sério', 'Amizade', 'Algo casual', 'Ainda não sei'];
const MARITAL_STATUS = ['Solteiro(a)', 'Divorciado(a)', 'Viúvo(a)', 'Separado(a)'];

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone_code: '+258',
    phone_number: '',
    gender: '',
    birth_date: '',
    province: '',
    city: '',
    interested_in: '',
    looking_for: 'Namoro sério',
    marital_status: 'Solteiro(a)',
    bio: '',
    photos: [] as string[],
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(formData.email, formData.password);

    if (error) {
      toast.error('Erro ao entrar: ' + error.message);
    } else {
      toast.success('Bem-vindo de volta!');
      navigate('/');
    }

    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const age = calculateAge(formData.birth_date);

    const { error } = await signUp(formData.email, formData.password, {
      name: formData.name,
      phone_code: formData.phone_code,
      phone_number: formData.phone_number,
      gender: formData.gender,
      birth_date: formData.birth_date,
      age,
      province: formData.province,
      city: formData.city,
      interested_in: formData.interested_in,
      looking_for: formData.looking_for,
      marital_status: formData.marital_status,
      bio: formData.bio,
      photos: formData.photos,
      country: 'Moçambique',
    });

    if (error) {
      toast.error('Erro ao criar conta: ' + error.message);
    } else {
      toast.success('Conta criada com sucesso!');
      navigate('/');
    }

    setLoading(false);
  };

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, reader.result as string]
      }));
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-4 w-full max-w-sm">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-kupido-text-secondary">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-kupido-text-muted" />
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="pl-10 bg-kupido-input border-transparent focus:border-pink focus:ring-pink/20"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-kupido-text-secondary">Senha</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-kupido-text-muted" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="pl-10 bg-kupido-input border-transparent focus:border-pink focus:ring-pink/20"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full gradient-bg hover:opacity-90 text-white font-semibold py-6 rounded-full btn-shadow transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </Button>

      <p className="text-center text-kupido-text-secondary text-sm">
        Não tem conta?{' '}
        <button
          type="button"
          onClick={() => setIsLogin(false)}
          className="text-pink hover:text-pink-hover font-medium"
        >
          Criar conta
        </button>
      </p>
    </form>
  );

  const renderRegisterForm = () => (
    <form onSubmit={handleRegister} className="space-y-4 w-full max-w-sm">
      {/* Step indicator */}
      <div className="flex justify-center gap-2 mb-6">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              s === step ? 'w-6 gradient-bg' : s < step ? 'bg-pink' : 'bg-kupido-input'
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4 slide-up">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-kupido-text-secondary">Nome completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-kupido-text-muted" />
              <Input
                id="name"
                placeholder="Seu nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="pl-10 bg-kupido-input border-transparent focus:border-pink focus:ring-pink/20"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-kupido-text-secondary">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-kupido-text-muted" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10 bg-kupido-input border-transparent focus:border-pink focus:ring-pink/20"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-kupido-text-secondary">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-kupido-text-muted" />
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10 bg-kupido-input border-transparent focus:border-pink focus:ring-pink/20"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-kupido-text-secondary">Telefone</Label>
            <div className="flex gap-2">
              <Input
                value={formData.phone_code}
                onChange={(e) => setFormData({ ...formData, phone_code: e.target.value })}
                className="w-20 bg-kupido-input border-transparent focus:border-pink focus:ring-pink/20"
              />
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-kupido-text-muted" />
                <Input
                  placeholder="84 123 4567"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="pl-10 bg-kupido-input border-transparent focus:border-pink focus:ring-pink/20"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 slide-up">
          <div className="space-y-2">
            <Label className="text-kupido-text-secondary">Gênero</Label>
            <div className="grid grid-cols-2 gap-3">
              {GENDERS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: g })}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.gender === g
                      ? 'border-pink bg-pink/10 text-pink'
                      : 'border-kupido-input text-kupido-text-secondary hover:border-kupido-text-muted'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-kupido-text-secondary">Interessado em</Label>
            <div className="grid grid-cols-2 gap-3">
              {GENDERS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setFormData({ ...formData, interested_in: g })}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.interested_in === g
                      ? 'border-pink bg-pink/10 text-pink'
                      : 'border-kupido-input text-kupido-text-secondary hover:border-kupido-text-muted'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth_date" className="text-kupido-text-secondary">Data de nascimento</Label>
            <Input
              id="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              className="bg-kupido-input border-transparent focus:border-pink focus:ring-pink/20"
              required
              max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 slide-up">
          <div className="space-y-2">
            <Label className="text-kupido-text-secondary">Província</Label>
            <select
              value={formData.province}
              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              className="w-full p-3 rounded-xl bg-kupido-input text-white border-transparent focus:border-pink focus:ring-pink/20 outline-none"
              required
            >
              <option value="" className="bg-kupido-card">Selecione...</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p} className="bg-kupido-card">{p}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city" className="text-kupido-text-secondary">Cidade</Label>
            <Input
              id="city"
              placeholder="Sua cidade"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="bg-kupido-input border-transparent focus:border-pink focus:ring-pink/20"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-kupido-text-secondary">Estado civil</Label>
            <div className="flex flex-wrap gap-2">
              {MARITAL_STATUS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormData({ ...formData, marital_status: s })}
                  className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                    formData.marital_status === s
                      ? 'gradient-bg text-white'
                      : 'bg-kupido-input text-kupido-text-secondary hover:bg-kupido-card'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-kupido-text-secondary">Procurando por</Label>
            <div className="flex flex-wrap gap-2">
              {LOOKING_FOR.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setFormData({ ...formData, looking_for: l })}
                  className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                    formData.looking_for === l
                      ? 'gradient-bg text-white'
                      : 'bg-kupido-input text-kupido-text-secondary hover:bg-kupido-card'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 slide-up">
          <div className="space-y-2">
            <Label className="text-kupido-text-secondary">Fotos de perfil</Label>
            <div className="grid grid-cols-3 gap-3">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden">
                  <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-kupido-bg/80 rounded-full flex items-center justify-center text-white hover:bg-kupido-error"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {formData.photos.length < 6 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-kupido-input flex flex-col items-center justify-center gap-2 text-kupido-text-muted hover:border-pink hover:text-pink transition-colors"
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
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-kupido-text-secondary">Sobre você</Label>
            <textarea
              id="bio"
              placeholder="Conte um pouco sobre você..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full p-3 rounded-xl bg-kupido-input text-white border-transparent focus:border-pink focus:ring-pink/20 outline-none resize-none min-h-[100px]"
              maxLength={500}
            />
            <p className="text-right text-xs text-kupido-text-muted">{formData.bio.length}/500</p>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        {step > 1 && (
          <Button
            type="button"
            onClick={prevStep}
            variant="outline"
            className="flex-1 border-kupido-input text-kupido-text-secondary hover:bg-kupido-input"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Voltar
          </Button>
        )}
        {step < 4 ? (
          <Button
            type="button"
            onClick={nextStep}
            className="flex-1 gradient-bg hover:opacity-90 text-white font-semibold rounded-full btn-shadow"
          >
            Próximo
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={loading || formData.photos.length === 0}
            className="flex-1 gradient-bg hover:opacity-90 text-white font-semibold rounded-full btn-shadow disabled:opacity-50"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </Button>
        )}
      </div>

      <p className="text-center text-kupido-text-secondary text-sm">
        Já tem conta?{' '}
        <button
          type="button"
          onClick={() => setIsLogin(true)}
          className="text-pink hover:text-pink-hover font-medium"
        >
          Entrar
        </button>
      </p>
    </form>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-pink/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-kupido-purple/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full">
        <div className="mb-8">
          <Logo size={64} />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}
          </h1>
          <p className="text-kupido-text-secondary">
            {isLogin ? 'Encontre seu amor no Kupido' : 'Comece sua jornada no amor'}
          </p>
        </div>

        {isLogin ? renderLoginForm() : renderRegisterForm()}
      </div>
    </div>
  );
};

export default AuthPage;
