import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../../../assets/styles/myaccount/addressesSection.css';
import { useAuth } from '../../../../contexts/AuthContext';
import {
  CHECKOUT_FORM_STORAGE_KEY,
  UAE_EMIRATES,
  getPreferredAddress,
  getUserScopedAddressKey,
  mapAccountAddressToCheckoutForm,
  normalizeAccountAddress,
  readAddressBook,
  writeAddressBook,
} from '../../../../utils/checkoutAddress';
import {
  normalizePhoneDigits,
  normalizePhoneForSave,
  validateUAEPhoneNumber,
} from '../../../../utils/uaePhoneValidation';

const API_BASE = 'https://db.store1920.com/wp-json/custom/v1';

const UAE_CITIES = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah',
  'Al Ain',
];

const createInitialFormData = (email = '') => ({
  id: null,
  country: 'AE',
  city: '',
  state: '',
  firstName: '',
  lastName: '',
  email,
  phone: '',
  isWhatsappSame: 'yes',
  street: '',
  apartment: '',
  floor: '',
  additional: '',
  saveAsDefault: true,
});

const toAddressFormData = (address, fallbackEmail = '') => ({
  id: address?.id || null,
  country: 'AE',
  city: address?.city || '',
  state: address?.state || '',
  firstName: address?.first_name || '',
  lastName: address?.last_name || '',
  email: address?.email || fallbackEmail || '',
  phone: normalizePhoneForSave(address?.phone || ''),
  isWhatsappSame: 'yes',
  street: address?.address_1 || '',
  apartment: address?.apartment || address?.address_2 || '',
  floor: address?.floor || '',
  additional: '',
  saveAsDefault: Boolean(address?.saveAsDefault),
});

const toAddressCard = (address) => normalizeAccountAddress(address);

const formatAddressPayload = (formData) => {
  const normalizedPhone = normalizePhoneForSave(formData.phone);

  return {
    billing: {
      fullName: `${formData.firstName} ${formData.lastName}`.trim(),
      address1: formData.street,
      address2: formData.apartment || formData.additional,
      city: formData.city,
      state: formData.state,
      postalCode: '',
      country: 'AE',
      phone: `+971${normalizedPhone}`,
      email: formData.email,
    },
    shipping: {
      fullName: `${formData.firstName} ${formData.lastName}`.trim(),
      address1: formData.street,
      address2: formData.apartment || formData.additional,
      city: formData.city,
      state: formData.state,
      postalCode: '',
      country: 'AE',
      email: formData.email,
    },
  };
};

const buildSavedAddress = (formData) => {
  const normalizedPhone = normalizePhoneForSave(formData.phone);

  return normalizeAccountAddress({
    id: formData.id,
    first_name: formData.firstName,
    last_name: formData.lastName,
    email: formData.email,
    address_1: formData.street,
    address_2: formData.apartment || formData.additional,
    apartment: formData.apartment,
    floor: formData.floor,
    city: formData.city,
    state: formData.state,
    country: 'AE',
    phone: `+971${normalizedPhone}`,
    delivery_type: 'Home',
    saveAsDefault: Boolean(formData.saveAsDefault),
  });
};

const syncCheckoutAddress = (storageKey, addresses, preferredAddressId, fallbackEmail = '') => {
  const addressBook = writeAddressBook(storageKey, addresses, preferredAddressId);
  const preferredAddress = getPreferredAddress(addressBook);

  if (preferredAddress) {
    localStorage.setItem(
      CHECKOUT_FORM_STORAGE_KEY,
      JSON.stringify(mapAccountAddressToCheckoutForm(preferredAddress, fallbackEmail))
    );
  } else {
    localStorage.removeItem(CHECKOUT_FORM_STORAGE_KEY);
  }

  return addressBook;
};

const AddressesSection = () => {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id || localStorage.getItem('userId');
  const storageKey = getUserScopedAddressKey(userId);

  const [addresses, setAddresses] = useState([]);
  const [preferredAddressId, setPreferredAddressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [phoneError, setPhoneError] = useState('');
  const [formData, setFormData] = useState(createInitialFormData(user?.email || ''));

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      email: prev.email || user?.email || '',
    }));
  }, [user?.email]);

  useEffect(() => {
    if (authLoading) return;

    const cachedBook = readAddressBook(storageKey);
    if (cachedBook.addresses.length) {
      setAddresses(cachedBook.addresses);
      setPreferredAddressId(cachedBook.preferredAddressId);
      setLoading(false);
      return;
    }

    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    axios
      .get(`${API_BASE}/get-address`, {
        withCredentials: true,
      })
      .then((res) => {
        const shipping = toAddressCard(res.data?.shipping);
        const billing = toAddressCard(res.data?.billing);
        const fetchedAddress = shipping || billing;

        if (!fetchedAddress) {
          setAddresses([]);
          setPreferredAddressId(null);
          return;
        }

        const addressBook = syncCheckoutAddress(
          storageKey,
          [{ ...fetchedAddress, saveAsDefault: true }],
          fetchedAddress.id,
          user?.email || ''
        );

        setAddresses(addressBook.addresses);
        setPreferredAddressId(addressBook.preferredAddressId);
      })
      .catch(() => {
        setAddresses([]);
        setPreferredAddressId(null);
      })
      .finally(() => setLoading(false));
  }, [authLoading, storageKey, user?.email, userId]);

  const resetForm = () => {
    setFormData(createInitialFormData(user?.email || ''));
    setPhoneError('');
    setEditingAddressId(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue =
      name === 'phone'
        ? normalizePhoneDigits(value).startsWith('5')
          ? normalizePhoneDigits(value).slice(0, 9)
          : normalizePhoneDigits(value)
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : nextValue,
    }));

    if (name === 'phone') {
      setPhoneError(validateUAEPhoneNumber(nextValue));
    }
  };

  const persistAddressToBackend = async (nextFormData) => {
    await axios.post(`${API_BASE}/save-address`, formatAddressPayload(nextFormData), {
      withCredentials: true,
    });
  };

  const handleSave = async () => {
    if (!userId) {
      alert('User not logged in.');
      return;
    }

    const nextPhoneError = validateUAEPhoneNumber(formData.phone);
    if (nextPhoneError) {
      setPhoneError(nextPhoneError);
      return;
    }

    setSaving(true);

    try {
      await persistAddressToBackend(formData);

      const savedAddress = buildSavedAddress(formData);
      const updatedAddresses = editingAddressId
        ? addresses.map((address) => (address.id === editingAddressId ? savedAddress : address))
        : [...addresses, savedAddress];

      const nextPreferredId =
        formData.saveAsDefault || !preferredAddressId ? savedAddress.id : preferredAddressId;

      const addressBook = syncCheckoutAddress(
        storageKey,
        updatedAddresses,
        nextPreferredId,
        formData.email || user?.email || ''
      );

      setAddresses(addressBook.addresses);
      setPreferredAddressId(addressBook.preferredAddressId);
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error(error);
      alert('Failed to save address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (address) => {
    setEditingAddressId(address.id);
    setFormData(toAddressFormData(address, user?.email || ''));
    setPhoneError('');
    setShowForm(true);
  };

  const handleSetPreferred = async (addressId) => {
    const selectedAddress = addresses.find((address) => address.id === addressId);
    if (!selectedAddress) return;

    setPreferredAddressId(addressId);
    const addressBook = syncCheckoutAddress(storageKey, addresses, addressId, user?.email || '');
    setAddresses(addressBook.addresses);
    setPreferredAddressId(addressBook.preferredAddressId);

    try {
      await persistAddressToBackend(toAddressFormData(selectedAddress, user?.email || ''));
    } catch (error) {
      console.error('Failed to sync preferred address to backend', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
  };

  if (loading) {
    return <p className="loading-text">Loading addresses...</p>;
  }

  return (
    <section className="addresses-section">
      <div className="addresses-header">
        <h2 className="section-title">Shipping Addresses</h2>
        {!showForm && (
          <button className="btn-primary" onClick={openAddForm}>
            {addresses.length ? 'Add New Address' : 'Add Address'}
          </button>
        )}
      </div>

      {!addresses.length && !showForm && (
        <div className="no-addresses">
          <p className="no-address-text">You don't have any shipping addresses saved.</p>
          <p className="encryption-note">Your preferred address will automatically fill checkout.</p>
        </div>
      )}

      {addresses.length > 0 && !showForm && (
        <div className="address-list">
          {addresses.map((addr) => {
            const isPreferred = addr.id === preferredAddressId;

            return (
              <div className={`address-card ${isPreferred ? 'preferred' : ''}`} key={addr.id}>
                <div className="address-card-top">
                  <div>
                    <p><strong>{addr.first_name} {addr.last_name}</strong></p>
                    {isPreferred && <span className="preferred-badge">Preferred Address</span>}
                  </div>
                  <label className="preferred-toggle">
                    <input
                      type="radio"
                      name="preferred-address"
                      checked={isPreferred}
                      onChange={() => handleSetPreferred(addr.id)}
                    />
                    Use as preferred
                  </label>
                </div>

                <p>{addr.address_1}</p>
                {addr.address_2 && <p>{addr.address_2}</p>}
                <p>{addr.city}, {addr.state}</p>
                <p>United Arab Emirates</p>
                <p>Phone: {addr.phone}</p>
                {addr.email && <p>Email: {addr.email}</p>}

                <div className="address-actions">
                  <button className="btn-secondary" onClick={() => handleEdit(addr)}>
                    Edit Address
                  </button>
                  {!isPreferred && (
                    <button className="btn-primary" onClick={() => handleSetPreferred(addr.id)}>
                      Make Preferred
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <form
          className="address-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!saving) handleSave();
          }}
        >
          <h3 className="form-title">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>

          <label className="input-label">
            Country / Region <span className="required">*</span>
            <input type="text" value="United Arab Emirates" readOnly disabled />
          </label>

          <label className="input-label">
            City / Emirate <span className="required">*</span>
            <select name="city" value={formData.city} onChange={handleChange} required>
              <option value="">Select City</option>
              {UAE_CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </label>

          <label className="input-label">
            Province / Emirates <span className="required">*</span>
            <select name="state" value={formData.state} onChange={handleChange} required>
              <option value="">Select Emirate</option>
              {UAE_EMIRATES.map((state) => (
                <option key={state.code} value={state.code}>{state.name}</option>
              ))}
            </select>
          </label>

          <label className="input-label">
            First Name <span className="required">*</span>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First name"
              required
            />
          </label>

          <label className="input-label">
            Last Name <span className="required">*</span>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last name"
              required
            />
          </label>

          <label className="input-label">
            Email Address <span className="required">*</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
          </label>

          <label className="input-label">
            Phone Number <span className="required">*</span>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="501234564"
              required
            />
            <small className="hint">Example: 501234564. Enter 9 digits starting with 5 only.</small>
            {phoneError && <small className="hint hint-error">{phoneError}</small>}
          </label>

          <fieldset className="whatsapp-fieldset">
            <legend>Is WhatsApp number same as phone?</legend>
            <label>
              <input
                type="radio"
                name="isWhatsappSame"
                value="yes"
                checked={formData.isWhatsappSame === 'yes'}
                onChange={handleChange}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="isWhatsappSame"
                value="no"
                checked={formData.isWhatsappSame === 'no'}
                onChange={handleChange}
              />
              No
            </label>
          </fieldset>

          <label className="input-label">
            Apartment / House / Office No <span className="required">*</span>
            <input
              type="text"
              name="apartment"
              value={formData.apartment}
              onChange={handleChange}
              placeholder="Apartment / House / Office No"
              required
            />
          </label>

          <label className="input-label">
            Building Name / Street <span className="required">*</span>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="Building Name / Street"
              required
            />
          </label>

          <label className="input-label">
            Floor / Unit (optional)
            <input
              type="text"
              name="floor"
              value={formData.floor}
              onChange={handleChange}
              placeholder="Floor / Unit"
            />
          </label>

          <label className="input-label">
            Additional / Detailed address (optional)
            <input
              type="text"
              name="additional"
              value={formData.additional}
              onChange={handleChange}
              placeholder="Landmark or extra details"
            />
          </label>

          <label className="input-label input-label-inline">
            <input
              type="checkbox"
              name="saveAsDefault"
              checked={formData.saveAsDefault}
              onChange={handleChange}
            />
            Save as preferred address for checkout
          </label>

          <div className="form-buttons">
            <button type="button" className="btn-secondary" onClick={handleCancel} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editingAddressId ? 'Update Address' : 'Save Address'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

export default AddressesSection;
