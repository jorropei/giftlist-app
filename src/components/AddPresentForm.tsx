import React, { useState } from 'react';
import { Gift, PackageOpen, Link as LinkIcon, Loader2 } from 'lucide-react';
import { extractProductInfo } from '../utils/productExtractor';
import { useTranslation } from '../hooks/useTranslation';
import type { Present } from '../types';

interface AddPresentFormProps {
  onAdd: (present: Omit<Present, 'id' | 'createdAt'>) => void;
}

export function AddPresentForm({ onAdd }: AddPresentFormProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    item: '',
    for: '',
    notes: '',
    url: '',
    imageUrl: '',
    price: null as number | null,
    brand: '',
    brandLogoUrl: '',
  });

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    try {
      const productInfo = await extractProductInfo(url);
      setFormData(prev => ({
        ...prev,
        ...productInfo,
        url,
      }));
    } catch (error) {
      setError('Failed to extract product information. Please fill in the details manually.');
      console.error('Failed to extract product info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const presentData = {
        ...formData,
        url: url || formData.url || undefined,
        imageUrl: formData.imageUrl || undefined,
        price: formData.price || undefined,
        brand: formData.brand || undefined,
        brandLogoUrl: formData.brandLogoUrl || undefined,
        from: 'Anonymous',
        priority: 'nice-to-have' as const,
        isPurchased: false,
        priceHistory: formData.price ? [{ price: formData.price, date: new Date() }] : [],
      };

      await onAdd(presentData);

      setFormData({
        item: '',
        for: '',
        notes: '',
        url: '',
        imageUrl: '',
        price: null,
        brand: '',
        brandLogoUrl: '',
      });
      setUrl('');
      setError(null);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-gray-800">
      <div className="flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <PackageOpen className="h-7 w-7 text-indigo-400" strokeWidth={1.5} />
          <h2 className="text-2xl font-semibold text-white">{t('newGift')}</h2>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
          <div className="flex-1 space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-1">
                {t('productUrl')}
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="input-field flex-1"
                  placeholder={t('pasteUrl')}
                />
                <button
                  type="button"
                  onClick={handleUrlSubmit}
                  disabled={loading}
                  className="button-primary !px-4"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <LinkIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="item" className="block text-sm font-medium text-gray-300 mb-1">
                {t('giftName')}
              </label>
              <input
                type="text"
                id="item"
                required
                value={formData.item}
                onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                className="input-field"
                placeholder={t('whatsTheGift')}
              />
            </div>

            <div>
              <label htmlFor="for" className="block text-sm font-medium text-gray-300 mb-1">
                {t('for')}
              </label>
              <input
                type="text"
                id="for"
                required
                value={formData.for}
                onChange={(e) => setFormData({ ...formData, for: e.target.value })}
                className="input-field"
                placeholder={t('whoIsItFor')}
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">
                {t('notes')} ({t('optional')})
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-field"
                placeholder={t('anyNotes')}
                rows={2}
              />
            </div>
          </div>

          <button
            type="submit"
            className="button-primary w-full py-2.5 flex items-center justify-center gap-2"
            disabled={!formData.item || !formData.for}
          >
            <Gift className="h-5 w-5" />
            {t('addGift')}
          </button>
        </form>
      </div>
    </div>
  );
}