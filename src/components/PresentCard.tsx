import React, { useState } from 'react';
import { Gift, Calendar, UserCircle, Check, DollarSign, Link, ShoppingCart, Pencil, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { extractDomainFromUrl } from '../utils/urlUtils';
import { useTranslation } from '../hooks/useTranslation';
import { useAuthStore } from '../store/useAuthStore';
import { useGiftStore } from '../store/useGiftStore';
import type { Present } from '../types';

interface PresentCardProps {
  present: Present;
  onPurchaseToggle: (id: string) => void;
  onPriorityChange: (id: string, priority: Present['priority']) => void;
}

export function PresentCard({ present, onPurchaseToggle, onPriorityChange }: PresentCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { deletePresent, updatePresent } = useGiftStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: present.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = async () => {
    if (window.confirm(t('deleteGift') + '?')) {
      await deletePresent(present.id);
    }
  };

  const isValidUrl = present.url && (present.url.startsWith('http://') || present.url.startsWith('https://'));
  const domain = isValidUrl ? extractDomainFromUrl(present.url!) : '';
  const brandLogoUrl = domain ? `https://logo.clearbit.com/${domain}` : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`h-full glass-card p-4 rounded-2xl border flex flex-col ${
        present.isPurchased 
          ? 'border-green-500/50 shadow-lg shadow-green-500/10' 
          : 'border-gray-800 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10'
      } transition-all duration-300 relative`}
    >
      {/* Image section */}
      <div className="h-32 mb-3 rounded-xl overflow-hidden relative bg-gray-800/50">
        {(present.imageUrl && !imageError) ? (
          <img
            src={present.imageUrl}
            alt={present.item}
            className="w-full h-full object-contain bg-white"
            onError={() => {
              setImageError(true);
              console.error('Failed to load image:', present.imageUrl);
            }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <Gift className="h-10 w-10 text-gray-600" strokeWidth={1.5} />
          </div>
        )}
        
        <div className="absolute top-2 right-2">
          <button
            onClick={() => onPurchaseToggle(present.id)}
            className={`p-1.5 rounded-full transition-all duration-300 ${
              present.isPurchased
                ? 'bg-green-500 text-white scale-110'
                : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Check className="h-4 w-4" />
          </button>
        </div>

        {brandLogoUrl && (
          <div className="absolute bottom-2 right-2">
            <img
              src={brandLogoUrl}
              alt={domain}
              className="h-6 w-6 rounded-full bg-white p-1"
              onError={(e) => e.currentTarget.style.display = 'none'}
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* Content section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-2">
          <Gift className="h-5 w-5 text-indigo-400 shrink-0" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold text-white truncate">{present.item}</h3>
        </div>
        
        <div className="space-y-2 text-gray-300 flex-1 min-h-0">
          {isEditing ? (
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {t('for')}
                </label>
                <input
                  type="text"
                  value={present.for}
                  onChange={(e) => updatePresent(present.id, { for: e.target.value })}
                  className="input-field"
                  placeholder={t('whoIsItFor')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {t('notes')}
                </label>
                <textarea
                  value={present.notes}
                  onChange={(e) => updatePresent(present.id, { notes: e.target.value })}
                  className="input-field"
                  placeholder={t('anyNotes')}
                  rows={2}
                />
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="w-full button-primary"
              >
                {t('save')}
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-gray-500 shrink-0" strokeWidth={1.5} />
                <p className="truncate">
                  {t('for')}: <span className="text-white">{present.for}</span>
                </p>
              </div>
              
              {present.price && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500 shrink-0" strokeWidth={1.5} />
                  <p className="text-white">${present.price.toFixed(2)}</p>
                </div>
              )}

              <div className="h-12 overflow-y-auto">
                {present.notes && (
                  <p className="text-gray-400 pl-6 text-sm">{present.notes}</p>
                )}
              </div>
              
              {isValidUrl && (
                <a
                  href={present.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-2 text-sm"
                >
                  <Link className="h-4 w-4 shrink-0" />
                  {t('viewProduct')}
                </a>
              )}
            </>
          )}
        </div>

        {/* Footer section */}
        <div className="mt-2 pt-2 border-t border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              <time>{new Date(present.createdAt).toLocaleDateString()}</time>
            </div>
            
            {present.createdBy === user?.uid && !isEditing && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 rounded-full bg-gray-800/80 text-gray-400 hover:bg-gray-700 transition-all"
                  title={t('editGift')}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1 rounded-full bg-gray-800/80 text-red-400 hover:bg-gray-700 transition-all"
                  title={t('deleteGift')}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {!isEditing && (
            isValidUrl ? (
              <a 
                href={present.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`w-full px-4 py-1.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 text-sm ${
                  present.isPurchased
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'button-primary'
                }`}
              >
                {present.isPurchased ? (
                  <>
                    {t('seeItem')} <Link className="ml-1 h-4 w-4 shrink-0" />
                  </>
                ) : (
                  <>
                    {t('buyIt')} <ShoppingCart className="ml-1 h-4 w-4 shrink-0" />
                  </>
                )}
              </a>
            ) : (
              <div className="w-full px-4 py-1.5 rounded-lg text-center text-gray-400 bg-gray-800/50 text-sm">
                {t('noLink')}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}