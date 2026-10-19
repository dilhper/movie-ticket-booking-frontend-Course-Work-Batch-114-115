/**
 * Small, dependency-free form validators. Each returns an error message or '' when valid.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^(?:\+?\d{1,3})?[\s-]?\d{9,10}$/;

export const required = (value: string | number | undefined | null, label = 'This field'): string =>
  value === undefined || value === null || String(value).trim() === '' ? `${label} is required` : '';

export const validateEmail = (value: string): string => {
  if (!value.trim()) return 'Email is required';
  return EMAIL_RE.test(value.trim()) ? '' : 'Enter a valid email address';
};

export const validatePassword = (value: string): string => {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return 'Password must contain letters and numbers';
  return '';
};

export const passwordStrength = (value: string): { score: number; label: string; tone: string } => {
  let score = 0;
  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const tones = ['danger', 'danger', 'warning', 'info', 'success'];
  return { score, label: labels[score], tone: tones[score] };
};

export const validatePhone = (value: string): string => {
  if (!value.trim()) return 'Phone number is required';
  return PHONE_RE.test(value.replace(/\s/g, '')) ? '' : 'Enter a valid phone number';
};

export const validateName = (value: string): string => {
  if (!value.trim()) return 'Name is required';
  if (value.trim().length < 2) return 'Name is too short';
  return '';
};

// payments

export const luhnCheck = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\D/g, '');
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return digits.length > 0 && sum % 10 === 0;
};

export const validateCardNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return 'Card number is required';
  if (digits.length < 13 || digits.length > 19) return 'Card number must be 13–19 digits';
  return luhnCheck(digits) ? '' : 'Card number is invalid';
};

export const validateExpiry = (value: string): string => {
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) return 'Use MM/YY format';
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return 'Invalid month';
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  return endOfMonth.getTime() < Date.now() ? 'Card has expired' : '';
};

export const validateCvv = (value: string): string => (/^\d{3,4}$/.test(value) ? '' : 'CVV must be 3 or 4 digits');

export const formatCardNumber = (value: string): string =>
  value
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, '$1 ');

export const formatExpiry = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

export const detectCardBrand = (value: string): string => {
  const d = value.replace(/\D/g, '');
  if (/^4/.test(d)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(d)) return 'mastercard';
  if (/^3[47]/.test(d)) return 'amex';
  return 'generic';
};

/** True when every value in an errors object is empty. */
export const isValid = (errors: Record<string, string>): boolean => Object.values(errors).every((e) => !e);
