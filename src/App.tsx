import React, { useEffect } from 'react';
import { Filters } from './components/Filters';
import { PresentList } from './components/PresentList';
import { AddPresentForm } from './components/AddPresentForm';
import { Auth } from './components/Auth';
import { ListManagement } from './components/ListManagement';
import { ShareButton } from './components/ShareButton';
import { Gift, LogOut, Plus } from 'lucide-react';
import { useAuthStore } from './store/useAuthStore';
import { useListStore } from './store/useListStore';
import { useGiftStore } from './store/useGiftStore';
import { useTranslation } from './hooks/useTranslation';
import { LanguageToggle } from './components/LanguageToggle';

export function App() {
  const { user, userProfile, loading: authLoading, signOut } = useAuthStore();
  const { currentList } = useListStore();
  const { t } = useTranslation();
  const [showAddForm, setShowAddForm] = React.useState(false);
  const { 
    presents, 
    filters, 
    loading: presentsLoading,
    error,
    fetchPresents,
    setFilters,
    addPresent,
    togglePurchaseStatus,
    updatePriority 
  } = useGiftStore();

  useEffect(() => {
    if (user && currentList) {
      fetchPresents();
    }
  }, [user, currentList, fetchPresents]);

  // Show loading state
  if (authLoading || presentsLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin text-[#4F6BFF]">
          <Gift className="h-8 w-8" />
        </div>
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    return <Auth />;
  }

  // Show list management if no list is selected
  if (!currentList) {
    return <ListManagement onListSelected={() => {}} />;
  }

  const filteredPresents = presents.filter(present => {
    const matchesStatus = 
      !filters.status ||
      (filters.status === 'purchased' ? present.isPurchased : !present.isPurchased);

    const matchesPerson = 
      !filters.person ||
      present.for === filters.person;

    return matchesStatus && matchesPerson;
  });

  return (
    <div className="min-h-screen bg-black">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Header - Mobile */}
        <div className="flex flex-col gap-4 lg:hidden mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gift className="h-7 w-7 text-[#4F6BFF]" strokeWidth={1.5} />
              <h1 className="text-3xl font-bold text-[#4F6BFF] truncate">{currentList.name}</h1>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="p-2 rounded-full bg-indigo-500 text-white"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <p className="text-gray-400 truncate">{t('welcome')}, {userProfile?.name}</p>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <button
                onClick={() => useListStore.getState().setCurrentList('')}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
              >
                {t('switchList')}
              </button>
              <button
                onClick={signOut}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Header - Desktop */}
        <div className="hidden lg:flex items-center justify-between mb-16">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Gift className="h-8 w-8 text-[#4F6BFF]" strokeWidth={1.5} />
              <h1 className="text-5xl font-bold text-[#4F6BFF]">{currentList.name}</h1>
            </div>
            <p className="text-gray-400">{t('welcome')}, {userProfile?.name}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <ShareButton 
              list={currentList}
              password={currentList.password}
              className="px-4 py-2 text-gray-400 hover:text-white"
            />
            <button
              onClick={() => useListStore.getState().setCurrentList('')}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              {t('switchList')}
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              {t('signOut')}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Form (1/3) */}
          <div className={`lg:w-1/3 lg:shrink-0 ${showAddForm ? 'block' : 'hidden lg:block'}`}>
            <AddPresentForm 
              onAdd={async (present) => {
                await addPresent(present);
                setShowAddForm(false);
              }} 
            />
          </div>
          
          {/* Right Column - Filters & List (2/3) */}
          <div className="lg:w-2/3">
            <Filters
              filters={filters}
              onFilterChange={setFilters}
              presents={presents}
            />
            
            {presents.length === 0 ? (
              <div className="text-center py-12 bg-gray-900/50 rounded-lg text-white">
                <Gift className="h-16 w-16 text-gray-600 mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-xl font-semibold mb-2">{t('noPresents')}</h3>
                <p className="text-gray-400 mb-8">
                  {t('startAdding')}
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="button-primary mx-auto"
                >
                  <Plus className="h-5 w-5" />
                  {t('add Gift')}
                </button>
              </div>
            ) : (
              <PresentList
                presents={filteredPresents}
                onPurchaseToggle={togglePurchaseStatus}
                onPriorityChange={updatePriority}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
