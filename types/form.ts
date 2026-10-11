// Forma daxil edilən məlumatların strukturu
export interface FormData {
  username: string;
  email: string;
  fullName: string;
  password: string;
  bio: string;
  role: string;
}

// Asinxron valenfeksiya vəziyyətləri
export type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid';

// Auto-save saxlanılma vəziyyətləri
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'failed';

// LocalStorage-də saxlanılan qaralama (draft) strukturu
export interface FormDraft {
  data: FormData;
  savedAt: string;
}