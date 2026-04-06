export const getProfileImageStorageKey = (email, customerId) => {
  if (email) {
    return `store1920_profile_image_${String(email).trim().toLowerCase()}`;
  }

  if (customerId) {
    return `store1920_profile_image_user_${String(customerId).trim()}`;
  }

  return null;
};

export const getStoredProfileImage = (email, customerId) => {
  const key = getProfileImageStorageKey(email, customerId);
  if (!key) return '';

  try {
    return localStorage.getItem(key) || '';
  } catch (error) {
    console.error('Failed to read profile image from localStorage', error);
    return '';
  }
};

export const resolveUserProfileImage = (user) =>
  user?.image ||
  user?.photoURL ||
  getStoredProfileImage(user?.email, user?.id) ||
  '';
