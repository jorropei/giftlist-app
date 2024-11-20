import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Gift } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { LanguageToggle } from './LanguageToggle';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { signIn, signUp, error } = useAuthStore();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
      }
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Gift className="h-12 w-12 text-[#4F6BFF] mb-4" strokeWidth={1.5} />
          <h1 className="text-4xl font-bold text-white mb-2">{t('giftLists')}</h1>
          <p className="text-gray-400">{t('welcome')}</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 rounded-2xl border border-gray-800">
          <div className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('name')}
                </label>
                <input
                  type="text"
                  id="name"
                  required={!isLogin}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder={t('enterName')}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                {t('email')}
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder={t('enterEmail')}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                {t('password')}
              </label>
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder={t('enterPassword')}
                minLength={6}
              />
            </div>

            <button type="submit" className="button-primary w-full">
              {isLogin ? t('signIn') : t('signUp')}
            </button>

            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-center text-sm text-gray-400 hover:text-white transition-colors"
            >
              {isLogin ? t('noAccount') : t('haveAccount')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}