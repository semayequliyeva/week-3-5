'use client';

import React from 'react';
import { ValidationStatus } from '../types/form';

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  asyncStatus?: ValidationStatus;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  placeholder,
  required,
  error,
  touched,
  asyncStatus,
  onChange,
  onBlur,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-xs font-bold uppercase text-gray-600 dark:text-gray-400">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {asyncStatus === 'validating' && (
          <span className="text-xs text-blue-500 animate-pulse">Checking availability...</span>
        )}
        {asyncStatus === 'valid' && (
          <span className="text-xs text-emerald-500 font-semibold">✓ Available</span>
        )}
      </div>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full p-3 text-sm rounded-xl border bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 transition ${
          error && touched
            ? 'border-red-500 focus:ring-red-500'
            : asyncStatus === 'valid'
            ? 'border-emerald-500 focus:ring-emerald-500'
            : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500'
        }`}
      />
      {error && touched && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
    </div>
  );
};