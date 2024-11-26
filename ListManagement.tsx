import React, { useState, useEffect } from 'react';
import { Users, Plus, LogIn, Loader2, LogOut, Trash2 } from 'lucide-react';
import { useListStore } from '../store/useListStore';
import { useAuthStore } from '../store/useAuthStore';
import { useTranslation } from '../hooks/useTranslation';
import { ShareButton } from './ShareButton';
import { LanguageToggle } from './LanguageToggle';

interface ListManagementProps {
  onListSelected: () => void;
}

export function ListManagement({ onListSelected }: ListManagementProps) {
  const { signOut } = useAuthStore();
  const { lists, loading, error, fetchUserLists, createList, joinList } = useListStore();
  const { t } = useTranslation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    password: ''
  });

  useEffect(() => {
    fetchUserLists();
  }, [fetchUserLists]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin text-[#4F6BFF]">
          <Loader2 className="h-8 w-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-2xl mx-auto pt-6 sm:pt-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-12">
          <div className="flex items-center gap-3">
            <Users className="h-7 w-7 sm:h-8 sm:w-8 text-[#4F6BFF]" strokeWidth={1.5} />
            <h1 className="text-3xl sm:text-4xl font-bold text-[#4F6BFF]">{t('giftLists')}</h1>
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t('signOut')}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Existing Lists */}
        {lists.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <h2 className="text-xl font-semibold text-white mb-4">{t('yourLists')}</h2>
            <div className="grid gap-4">
              {lists.map(list => (
                <div
                  key={list.id}
                  className="glass-card p-4 sm:p-6 rounded-xl border border-gray-800 hover:border-indigo-500/30 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-lg font-medium text-white">{list.name}</h3>
                    <div className="flex items-center gap-4">
                      <ShareButton 
                        list={list}
                        password={list.password || ''}
                        className="text-gray-400 hover:text-white"
                      />
                      {list.createdBy === useAuthStore.getState().user?.uid && (
                        <button
                          onClick={async () => {
                            if (window.confirm(t('confirmDeleteList', { name: list.name }))) {
                              await useListStore.getState().deleteList(list.id);
                            }
                          }}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                          aria-label={t('deleteList')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          useListStore.getState().setCurrentList(list.id);
                          onListSelected();
                        }}
                        className="px-4 py-2 text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        {t('openList')}
                      </button>
                    </div>
                  </div>
                  {list.description && (
                    <p className="text-gray-400 mt-2">{list.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create/Join Buttons */}
        {!showCreateForm && !showJoinForm && (
          <div className="flex flex-row gap-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex-1 glass-card p-4 rounded-xl border border-gray-800 hover:border-indigo-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="h-5 w-5 text-[#4F6BFF]" strokeWidth={1.5} />
              <span className="font-medium text-white">{t('createList')}</span>
            </button>
            <button
              onClick={() => setShowJoinForm(true)}
              className="flex-1 glass-card p-4 rounded-xl border border-gray-800 hover:border-indigo-500/30 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="h-5 w-5 text-[#4F6BFF]" strokeWidth={1.5} />
              <span className="font-medium text-white">{t('joinList')}</span>
            </button>
          </div>
        )}

        {/* Forms */}
        {(showCreateForm || showJoinForm) && (
          <div className="glass-card p-4 sm:p-6 rounded-xl border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-6">
              {showCreateForm ? t('createList') : t('joinList')}
            </h2>
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  if (showCreateForm) {
                    await createList(formData.name, formData.description, formData.password);
                    setShowCreateForm(false);
                  } else {
                    await joinList(formData.name, formData.password);
                    setShowJoinForm(false);
                  }
                  setFormData({ name: '', description: '', password: '' });
                } catch (error) {
                  // Error is handled by the store
                }
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('listName')}
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder={t('enterName')}
                />
              </div>

              {showCreateForm && (
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    {t('description')} ({t('optional')})
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    placeholder={t('description')}
                    rows={3}
                  />
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('password')}
                </label>
                <input
                  type="password"
                  id="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                  placeholder={t('enterPassword')}
                  minLength={6}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setShowJoinForm(false);
                    setFormData({ name: '', description: '', password: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button type="submit" className="flex-1 button-primary">
                  {showCreateForm ? t('createList') : t('joinList')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}