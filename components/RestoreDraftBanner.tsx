'use client';

import React from 'react';
import { FormDraft } from '../types/form';

interface RestoreDraftBannerProps {
  draft: FormDraft;
  onRestore: () => void;
  onDiscard: () => void;
}

export const RestoreDraftBanner: React.FC<RestoreDraftBannerProps> = ({ draft, onRestore, onDiscard }) => {
  return (
    <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>
        <p className="text-sm font-bold text-blue-900 dark:text-blue-200">Unsaved draft found!</p>
        <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
          Saved automatically at {draft.savedAt}. Do you want to restore your inputs?
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onRestore}
          type="button"
          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer"
        >
          Restore Draft
        </button>
        <button
          onClick={onDiscard}
          type="button"
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition cursor-pointer"
        >
          Discard
        </button>
      </div>
    </div>
  );
};