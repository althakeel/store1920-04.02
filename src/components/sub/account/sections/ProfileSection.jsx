import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../../assets/styles/myaccount/ProfileSection.css';
import { API_BASE, CONSUMER_KEY, CONSUMER_SECRET } from '../../../../api/woocommerce';
import { useAuth } from '../../../../contexts/AuthContext';
import {
  normalizePhoneDigits,
  normalizePhoneForSave,
  validateUAEPhoneNumber,
} from '../../../../utils/uaePhoneValidation';

function getInitials(user) {
  if (user.first_name && user.last_name) {
    return (
      user.first_name.charAt(0).toUpperCase() +
      user.last_name.charAt(0).toUpperCase()
    );
  }
  if (user.email) return user.email.charAt(0).toUpperCase();
  return '?';
}

function getColorForInitials(initials) {
  const colors = [
    '#386641',
    '#6a994e',
    '#a7c957',
    '#f2e8cf',
    '#bc4749',
    '#c84b31',
    '#6b4226',
  ];
  const charCode = initials.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
}

function buildProfileShell(authUser, fallbackUserId) {
  const displayName = authUser?.name || '';
  const nameParts = displayName.trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ');

  return {
    id: fallbackUserId || authUser?.id || null,
    first_name: firstName,
    last_name: lastName,
    email: authUser?.email || '',
    billing: {
      first_name: firstName,
      last_name: lastName,
      phone: '',
      address_1: '',
      address_2: '',
      city: '',
      state: '',
      postcode: '',
      country: 'AE',
    },
    shipping: {
      first_name: firstName,
      last_name: lastName,
      address_1: '',
      address_2: '',
      city: '',
      state: '',
      postcode: '',
      country: 'AE',
    },
    avatar_url: authUser?.image || authUser?.photoURL || '',
    date_created: new Date().toISOString(),
  };
}

function buildFormData(profile) {
  return {
    fullName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
    email: profile.email || '',
    phone: profile.billing?.phone || '',
    billing: { ...(profile.billing || {}) },
    shipping: { ...(profile.shipping || {}) },
  };
}

function normalizeCustomerId(...candidates) {
  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null) {
      continue;
    }

    const value = String(candidate).trim();
    if (!value || value === 'undefined' || value === 'null') {
      continue;
    }

    return value;
  }

  return null;
}

function getProfileImageStorageKey(email, customerId) {
  if (email) {
    return `store1920_profile_image_${String(email).trim().toLowerCase()}`;
  }

  if (customerId) {
    return `store1920_profile_image_user_${String(customerId).trim()}`;
  }

  return null;
}

function getStoredProfileImage(email, customerId) {
  const key = getProfileImageStorageKey(email, customerId);
  if (!key) {
    return '';
  }

  try {
    return localStorage.getItem(key) || '';
  } catch (error) {
    console.error('Failed to read profile image from localStorage', error);
    return '';
  }
}

function saveStoredProfileImage(email, customerId, image) {
  const key = getProfileImageStorageKey(email, customerId);
  if (!key) {
    return;
  }

  try {
    if (image) {
      localStorage.setItem(key, image);
    } else {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Failed to save profile image to localStorage', error);
  }
}

const ProfileSection = ({ userId }) => {
  const { user: authUser, updateUser } = useAuth();
  const effectiveUserId = normalizeCustomerId(
    userId,
    authUser?.id,
    localStorage.getItem('userId')
  );
  const [user, setUser] = useState(null);
  const [ordersCount, setOrdersCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const persistedProfileImage = getStoredProfileImage(authUser?.email, effectiveUserId);

  useEffect(() => {
    const fallbackProfile = buildProfileShell(authUser, effectiveUserId);

    if (!effectiveUserId) {
      setUser(fallbackProfile);
      setFormData(buildFormData(fallbackProfile));
      setAvatarPreview(
        authUser?.image || authUser?.photoURL || persistedProfileImage || fallbackProfile.avatar_url || ''
      );
      setEditMode(true);
      setOrdersCount(0);
      setLoading(false);
      setError(null);
      return;
    }

    if (!userId && authUser?.email) {
      setUser(fallbackProfile);
      setFormData(buildFormData(fallbackProfile));
      setAvatarPreview(
        authUser?.image || authUser?.photoURL || persistedProfileImage || fallbackProfile.avatar_url || ''
      );
      setEditMode(true);
    }

    if (!effectiveUserId) {
      setUser(null);
      setOrdersCount(null);
      setLoading(false);
      return;
    }

    const fetchUserAndOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const userRes = await axios.get(`${API_BASE}/customers/${effectiveUserId}`, {
          timeout: 8000,
          params: { consumer_key: CONSUMER_KEY, consumer_secret: CONSUMER_SECRET },
        });
        setUser(userRes.data);
        setFormData(buildFormData(userRes.data));
        setAvatarPreview(
          authUser?.image ||
          authUser?.photoURL ||
          persistedProfileImage ||
          userRes.data.avatar_url ||
          ''
        );
        setEditMode(false);

        const ordersRes = await axios.get(`${API_BASE}/orders`, {
          timeout: 8000,
          params: {
            customer: effectiveUserId,
            per_page: 1,
            consumer_key: CONSUMER_KEY,
            consumer_secret: CONSUMER_SECRET,
          },
        });
        const totalOrders = parseInt(ordersRes.headers['x-wp-total'], 10) || 0;
        setOrdersCount(totalOrders);
      } catch (e) {
        setError(null);
        setUser(fallbackProfile);
        setFormData(buildFormData(fallbackProfile));
        setAvatarPreview(
          authUser?.image || authUser?.photoURL || persistedProfileImage || fallbackProfile.avatar_url || ''
        );
        setOrdersCount(0);
        setEditMode(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndOrders();
  }, [authUser, effectiveUserId, persistedProfileImage, userId]);

  const handleInputChange = (field, value) => {
    const normalizedValue =
      field === 'billing.phone'
        ? normalizePhoneDigits(value).startsWith('5')
          ? normalizePhoneDigits(value).slice(0, 9)
          : normalizePhoneDigits(value)
        : value;

    setFormData((prev) => {
      if (field === 'fullName') {
        return { ...prev, fullName: normalizedValue };
      }
      if (field.startsWith('billing.')) {
        const key = field.split('.')[1];
        return {
          ...prev,
          billing: { ...prev.billing, [key]: normalizedValue },
        };
      } else if (field.startsWith('shipping.')) {
        const key = field.split('.')[1];
        return {
          ...prev,
          shipping: { ...prev.shipping, [key]: normalizedValue },
        };
      }
      return { ...prev, [field]: normalizedValue };
    });

    if (field === 'billing.phone') {
      setPhoneError(validateUAEPhoneNumber(normalizedValue));
    }
  };

  const cancelEdit = () => {
    if (user) {
      setFormData(buildFormData(user));
    }
    setAvatarPreview(
      authUser?.image || authUser?.photoURL || persistedProfileImage || user?.avatar_url || ''
    );
    setPhoneError('');
    setEditMode(false);
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const nextImage = typeof reader.result === 'string' ? reader.result : '';
      setAvatarPreview(nextImage);
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    if (!effectiveUserId) {
      alert('Profile cannot be saved because no user account id was found.');
      return;
    }

    const nextPhoneError = validateUAEPhoneNumber(formData.billing?.phone || '');
    if (nextPhoneError) {
      setPhoneError(nextPhoneError);
      return;
    }

    setSaving(true);
    try {
      // Split fullName into first and last name
      const names = formData.fullName.trim().split(' ');
      const first_name = names.shift() || '';
      const last_name = names.join(' ') || '';

      const billing = {
        first_name,
        last_name,
        company: formData.billing?.company || '',
        address_1: formData.billing?.address_1 || '',
        address_2: formData.billing?.address_2 || '',
        city: formData.billing?.city || '',
        state: formData.billing?.state || '',
        postcode: formData.billing?.postcode || '',
        country: formData.billing?.country || 'AE',
        email: formData.email || '',
        phone: `+971${normalizePhoneForSave(formData.billing?.phone || '')}`,
      };

      const shipping = {
        first_name,
        last_name,
        company: formData.shipping?.company || '',
        address_1: formData.shipping?.address_1 || '',
        address_2: formData.shipping?.address_2 || '',
        city: formData.shipping?.city || '',
        state: formData.shipping?.state || '',
        postcode: formData.shipping?.postcode || '',
        country: formData.shipping?.country || 'AE',
      };

      const payload = {
        first_name,
        last_name,
        email: formData.email,
        billing,
        shipping,
      };

      await axios.put(`${API_BASE}/customers/${effectiveUserId}`, payload, {
        params: { consumer_key: CONSUMER_KEY, consumer_secret: CONSUMER_SECRET },
      });

      const nextUser = {
        ...user,
        ...payload,
        avatar_url: avatarPreview || user?.avatar_url || '',
      };

      saveStoredProfileImage(formData.email, effectiveUserId, avatarPreview || user?.avatar_url || '');

      setUser(nextUser);
      setPhoneError('');
      updateUser({
        name: `${first_name} ${last_name}`.trim() || formData.email,
        email: formData.email,
        image: avatarPreview || null,
      });
      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (e) {
      alert('Failed to update profile.');
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = () => {
    if (
      window.confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      alert('Delete account API call not implemented yet.');
    }
  };

  if (loading)
    return <p className="ps-loading">Loading profile...</p>;
  if (error)
    return <p className="ps-error">{error}</p>;
  if (!user || !formData)
    return <p className="ps-loading">Loading profile...</p>;

  const initials = getInitials(user);
  const bgColor = getColorForInitials(initials);
  const displayAvatar =
    avatarPreview ||
    authUser?.image ||
    authUser?.photoURL ||
    persistedProfileImage ||
    user.avatar_url;

  return (
    <section className="ps-section">
      <header className="ps-header">
        <h1 className="ps-title">Customer Profile</h1>
        {!editMode && (
          <button
            className="ps-btn ps-btn-edit"
            onClick={() => setEditMode(true)}
            aria-label="Edit profile"
          >
            Edit
          </button>
        )}
      </header>

      <div className="ps-profile-picture-card">
        <div className="ps-profile-picture-header">
          <div>
            <h2 className="ps-profile-picture-title">Profile Picture</h2>
          </div>
        </div>

        <div className="ps-profile-picture-preview">
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt="Profile"
              className="ps-avatar ps-avatar-large"
              loading="lazy"
            />
          ) : (
            <div
              className="ps-avatar ps-avatar-initials ps-avatar-large"
              style={{ backgroundColor: bgColor }}
              aria-label="Profile initials"
            >
              {initials}
            </div>
          )}
        </div>

        {editMode && (
          <div className="ps-profile-picture-actions">
            <label
              htmlFor="profile-avatar-upload"
              className="ps-btn ps-btn-edit"
              style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}
            >
              Change Photo
            </label>
            <input
              id="profile-avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
          </div>
        )}
      </div>

      <div className="ps-main">
        <div className="ps-info">
          {editMode ? (
            <input
              type="text"
              value={formData.fullName}
              placeholder="Full Name"
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              required
              className="ps-input ps-single-input"
            />
          ) : (
            <h2 className="ps-name">{`${user.first_name} ${user.last_name}`}</h2>
          )}

          {editMode ? (
            <input
              type="email"
              value={formData.email}
              placeholder="Email"
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="ps-input ps-single-input"
              required
            />
          ) : (
            <p className="ps-email">{user.email}</p>
          )}

          {editMode ? (
            <>
              <input
                type="tel"
                value={formData.billing?.phone || ''}
                placeholder="501234564"
                onChange={(e) => handleInputChange('billing.phone', e.target.value)}
                className="ps-input ps-single-input"
              />
              <p className="ps-help">Example: 501234564. Enter 9 digits starting with 5 only.</p>
              {phoneError && <p className="ps-error">{phoneError}</p>}
            </>
          ) : (
            <p className="ps-phone">
              <strong>Phone:</strong> {user.billing?.phone || 'N/A'}
            </p>
          )}

          <p className="ps-orders">
            <strong>Total Orders:</strong>{' '}
            {ordersCount !== null ? ordersCount : 'Loading...'}
          </p>

          <p className="ps-date">
            <strong>Account Created:</strong>{' '}
            {new Date(user.date_created).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="ps-addresses">
        <div className="ps-address-block">
          <h3 className="ps-address-title">Billing Address</h3>
          {editMode ? (
            <>
              <input
                type="text"
                placeholder="Address 1"
                value={formData.billing.address_1 || ''}
                onChange={(e) => handleInputChange('billing.address_1', e.target.value)}
                className="ps-input"
              />
              <input
                type="text"
                placeholder="Address 2"
                value={formData.billing.address_2 || ''}
                onChange={(e) => handleInputChange('billing.address_2', e.target.value)}
                className="ps-input"
              />
              <input
                type="text"
                placeholder="City"
                value={formData.billing.city || ''}
                onChange={(e) => handleInputChange('billing.city', e.target.value)}
                className="ps-input"
              />
              <input
                type="text"
                placeholder="State"
                value={formData.billing.state || ''}
                onChange={(e) => handleInputChange('billing.state', e.target.value)}
                className="ps-input"
              />
              <input
                type="text"
                placeholder="Postcode"
                value={formData.billing.postcode || ''}
                onChange={(e) => handleInputChange('billing.postcode', e.target.value)}
                className="ps-input"
              />
              <input
                type="text"
                placeholder="Country"
                value="United Arab Emirates"
                className="ps-input"
                readOnly
                disabled
              />
            </>
          ) : user.billing && user.billing.address_1 ? (
            <>
              <p className="ps-address-line">{user.billing.address_1}</p>
              {user.billing.address_2 && (
                <p className="ps-address-line">{user.billing.address_2}</p>
              )}
              <p className="ps-address-line">
                {user.billing.city}, {user.billing.state} {user.billing.postcode}
              </p>
              <p className="ps-address-line">{user.billing.country}</p>
            </>
          ) : (
            <p className="ps-no-address">No billing address set.</p>
          )}
        </div>

        <div className="ps-address-block">
          <h3 className="ps-address-title">Shipping Address</h3>
          {editMode ? (
            <>
              <input
                type="text"
                placeholder="Address 1"
                value={formData.shipping.address_1 || ''}
                onChange={(e) => handleInputChange('shipping.address_1', e.target.value)}
                className="ps-input"
              />
              <input
                type="text"
                placeholder="Address 2"
                value={formData.shipping.address_2 || ''}
                onChange={(e) => handleInputChange('shipping.address_2', e.target.value)}
                className="ps-input"
              />
              <input
                type="text"
                placeholder="City"
                value={formData.shipping.city || ''}
                onChange={(e) => handleInputChange('shipping.city', e.target.value)}
                className="ps-input"
              />
              <input
                type="text"
                placeholder="State"
                value={formData.shipping.state || ''}
                onChange={(e) => handleInputChange('shipping.state', e.target.value)}
                className="ps-input"
              />
              <input
                type="text"
                placeholder="Postcode"
                value={formData.shipping.postcode || ''}
                onChange={(e) => handleInputChange('shipping.postcode', e.target.value)}
                className="ps-input"
              />
              <input
                type="text"
                placeholder="Country"
                value="United Arab Emirates"
                className="ps-input"
                readOnly
                disabled
              />
            </>
          ) : user.shipping && user.shipping.address_1 ? (
            <>
              <p className="ps-address-line">{user.shipping.address_1}</p>
              {user.shipping.address_2 && (
                <p className="ps-address-line">{user.shipping.address_2}</p>
              )}
              <p className="ps-address-line">
                {user.shipping.city}, {user.shipping.state} {user.shipping.postcode}
              </p>
              <p className="ps-address-line">{user.shipping.country}</p>
            </>
          ) : (
            <p className="ps-no-address">No shipping address set.</p>
          )}
        </div>
      </div>

      <div className="ps-buttons">
        {editMode ? (
          <>
            <button
              className="ps-btn ps-btn-save"
              onClick={saveProfile}
              disabled={saving}
              aria-label="Save profile changes"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              className="ps-btn ps-btn-cancel"
              onClick={cancelEdit}
              disabled={saving}
              aria-label="Cancel editing profile"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            className="ps-btn ps-btn-delete"
            onClick={deleteAccount}
            aria-label="Delete account"
          >
            Delete Account
          </button>
        )}
      </div>
    </section>
  );
};

export default ProfileSection;
