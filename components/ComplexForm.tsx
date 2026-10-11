'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FormData, ValidationStatus, SaveStatus, FormDraft } from '../types/form';
import { checkUsernameAvailable, checkEmailAvailable } from '../utils/mockDb';
import { InputField } from './InputField';
import { RestoreDraftBanner } from './RestoreDraftBanner';

const INITIAL_FORM_DATA: FormData = {
  username: '',
  email: '',
  fullName: '',
  password: '',
  bio: '',
  role: 'developer',
};

const DRAFT_STORAGE_KEY = 'complex_form_draft_v1';

export default function ComplexForm() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({
    username: false,
    email: false,
    fullName: false,
    password: false,
    bio: false,
    role: false,
  });

  const [errors, setErrors] = useState<Record<keyof FormData, string>>({
    username: '',
    email: '',
    fullName: '',
    password: '',
    bio: '',
    role: '',
  });

  const [asyncStatus, setAsyncStatus] = useState<{ username: ValidationStatus; email: ValidationStatus }>({
    username: 'idle',
    email: 'idle',
  });

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [savedDraft, setSavedDraft] = useState<FormDraft | null>(null);
  const [showRestorePrompt, setShowRestorePrompt] = useState<boolean>(false);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Səhifə açıldıqda localStorage-də qalan qaralamanı yoxlamaq
  useEffect(() => {
    try {
      const rawDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (rawDraft) {
        const parsed: FormDraft = JSON.parse(rawDraft);
        setSavedDraft(parsed);
        setShowRestorePrompt(true);
      }
    } catch {
      // Storage xətalarını ötür
    }
  }, []);

  const handleRestoreDraft = () => {
    if (savedDraft) {
      setFormData(savedDraft.data);
      setLastSavedTime(savedDraft.savedAt);
      setShowRestorePrompt(false);
      setTouched({ username: true, email: true, fullName: true, password: true, bio: true, role: true });
    }
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setSavedDraft(null);
    setShowRestorePrompt(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name as keyof FormData]: true }));
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // 2. USERNAME üçün Debounced Async Validation (Race Condition Guard ilə)
  useEffect(() => {
    if (!touched.username || !formData.username) {
      setAsyncStatus((prev) => ({ ...prev, username: 'idle' }));
      return;
    }

    if (formData.username.trim().length < 3) {
      setErrors((prev) => ({ ...prev, username: 'Username must be at least 3 characters.' }));
      setAsyncStatus((prev) => ({ ...prev, username: 'invalid' }));
      return;
    }

    setAsyncStatus((prev) => ({ ...prev, username: 'validating' }));
    let isCancelled = false; // Köhnə sorğuların nəticəsini ləğv etmək üçün

    const timer = setTimeout(async () => {
      const isAvailable = await checkUsernameAvailable(formData.username);
      if (isCancelled) return;

      if (!isAvailable) {
        setErrors((prev) => ({ ...prev, username: 'Username is taken. Try "samaya".' }));
        setAsyncStatus((prev) => ({ ...prev, username: 'invalid' }));
      } else {
        setErrors((prev) => ({ ...prev, username: '' }));
        setAsyncStatus((prev) => ({ ...prev, username: 'valid' }));
      }
    }, 400);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [formData.username, touched.username]);

  // 3. EMAIL üçün Debounced Async Validation
  useEffect(() => {
    if (!touched.email || !formData.email) {
      setAsyncStatus((prev) => ({ ...prev, email: 'idle' }));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors((prev) => ({ ...prev, email: 'Invalid email format.' }));
      setAsyncStatus((prev) => ({ ...prev, email: 'invalid' }));
      return;
    }

    setAsyncStatus((prev) => ({ ...prev, email: 'validating' }));
    let isCancelled = false;

    const timer = setTimeout(async () => {
      const isAvailable = await checkEmailAvailable(formData.email);
      if (isCancelled) return;

      if (!isAvailable) {
        setErrors((prev) => ({ ...prev, email: 'Email already registered.' }));
        setAsyncStatus((prev) => ({ ...prev, email: 'invalid' }));
      } else {
        setErrors((prev) => ({ ...prev, email: '' }));
        setAsyncStatus((prev) => ({ ...prev, email: 'valid' }));
      }
    }, 400);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [formData.email, touched.email]);

  // 4. autosave mexanizmasi(1.5s delay)
  const isAnyTouched = useMemo(() => Object.values(touched).some(Boolean), [touched]);

  const executeAutoSave = useCallback(() => {
    setSaveStatus('saving');
    setTimeout(() => {
      try {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        const draftObj: FormDraft = { data: formData, savedAt: timeStr };

        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftObj));
        setSaveStatus('saved');
        setLastSavedTime(timeStr);
      } catch {
        setSaveStatus('failed');
      }
    }, 300);
  }, [formData]);

  useEffect(() => {
    if (!isAnyTouched) return;
    setSaveStatus('idle');

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      executeAutoSave();
    }, 1500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [formData, isAnyTouched, executeAutoSave]);

  const handleClearAll = () => {
    setFormData(INITIAL_FORM_DATA);
    setTouched({ username: false, email: false, fullName: false, password: false, bio: false, role: false });
    setErrors({ username: '', email: '', fullName: '', password: '', bio: '', role: '' });
    setAsyncStatus({ username: 'idle', email: 'idle' });
    setSaveStatus('idle');
    setLastSavedTime(null);
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
      {showRestorePrompt && savedDraft && (
        <RestoreDraftBanner draft={savedDraft} onRestore={handleRestoreDraft} onDiscard={handleDiscardDraft} />
      )}

      {/* Başlıq və Auto-Save Status İndikatoru */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b dark:border-gray-800">
        <div>
          <h1 className="text-xl font-bold">Account Registration</h1>
          <p className="text-xs text-gray-500 mt-0.5">Debounced async validation & auto-save</p>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
          {saveStatus === 'saving' && 'Saving...'}
          {saveStatus === 'saved' && `Saved at ${lastSavedTime}`}
          {saveStatus === 'failed' && 'Save failed'}
          {saveStatus === 'idle' && 'Ready'}
        </span>
      </div>

      <div aria-live="polite" className="sr-only">
        {saveStatus === 'saving' && 'Saving form draft automatically.'}
        {saveStatus === 'saved' && `Form draft saved at ${lastSavedTime}.`}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); alert('Form submitted successfully!'); }} className="space-y-4">
        <InputField
          label="Username"
          name="username"
          value={formData.username}
          required
          error={errors.username}
          touched={touched.username}
          asyncStatus={asyncStatus.username}
          onChange={handleChange}
          onBlur={() => handleBlur('username')}
        />

        <InputField
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          required
          error={errors.email}
          touched={touched.email}
          asyncStatus={asyncStatus.email}
          onChange={handleChange}
          onBlur={() => handleBlur('email')}
        />

        <InputField
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          required
          error={errors.fullName}
          touched={touched.fullName}
          onChange={handleChange}
          onBlur={() => handleBlur('fullName')}
        />

        <InputField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          required
          error={errors.password}
          touched={touched.password}
          onChange={handleChange}
          onBlur={() => handleBlur('password')}
        />

        <div>
          <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-400 mb-1.5">
            Role
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-3 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="developer">Frontend Developer</option>
            <option value="designer">UI/UX Designer</option>
            <option value="product">Product Manager</option>
          </select>
        </div>

        <div className="pt-4 flex justify-between border-t dark:border-gray-800">
          <button
            type="button"
            onClick={handleClearAll}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            Clear Form & Draft
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            Submit Application
          </button>
        </div>
      </form>
    </div>
  );
}