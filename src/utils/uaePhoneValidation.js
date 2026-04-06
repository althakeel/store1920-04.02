export const normalizePhoneDigits = (value = '') => String(value).replace(/\D/g, '');

export const normalizePhoneForSave = (value = '') => {
  let digits = normalizePhoneDigits(value);

  if (digits.startsWith('971')) digits = digits.slice(3);
  if (digits.startsWith('0')) digits = digits.slice(1);

  return digits.slice(0, 9);
};

export const validateUAEPhoneNumber = (value = '') => {
  const digits = normalizePhoneDigits(value);

  if (!digits) return 'Phone number is required';
  if (digits.startsWith('971')) return 'Do not type 971. Start with 5 (e.g., 501234567)';
  if (digits.startsWith('0')) return 'Do not start with 0. Start with 5 (e.g., 501234567)';
  if (digits[0] !== '5') return 'Number must start with 5 (e.g., 501234567)';
  if (digits.length !== 9) return 'Must be exactly 9 digits (e.g., 501234567)';

  return '';
};
