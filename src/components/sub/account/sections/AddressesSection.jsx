import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../../assets/styles/myaccount/addressesSection.css';
import { useAuth } from '../../../../contexts/AuthContext';

const API_BASE = 'https://db.store1920.com/wp-json/custom/v1';
const LOCAL_ADDRESS_KEY = 'store1920_saved_address';

const getStoredAddress = (storageKey) => {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to read saved address from localStorage', error);
    return null;
  }
};

const toAddressCard = (address) => {
  if (!address) {
    return null;
  }

  const fullName = address.fullName || address.full_name || '';
  const firstName = address.first_name || fullName.split(' ').shift() || '';
  const lastName = address.last_name || fullName.split(' ').slice(1).join(' ') || '';
  const address1 = address.address_1 || address.address1 || '';

  if (!address1) {
    return null;
  }

  return {
    first_name: firstName,
    last_name: lastName,
    address_1: address1,
    address_2: address.address_2 || address.address2 || '',
    city: address.city || '',
    state: address.state || '',
    country: address.country || '',
    phone: address.phone || '',
  };
};

const AddressesSection = () => {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id || localStorage.getItem('userId');
  const storageKey = userId ? `${LOCAL_ADDRESS_KEY}_${userId}` : LOCAL_ADDRESS_KEY;

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    country: '',
    city: '',
    firstName: '',
    lastName: '',
    phone: '',
    isWhatsappSame: 'yes',
    street: '',
    additional: '',
  });
  const [citiesOptions, setCitiesOptions] = useState([]);
  const [countries, setCountries] = useState([]);

  // Fetch countries for dropdown
  useEffect(() => {
    axios
      .get('https://db.store1920.com/wp-json/wc/v3/data/countries', {
        params: {
          consumer_key: 'ck_2e4ba96dde422ed59388a09a139cfee591d98263',
          consumer_secret: 'cs_43b449072b8d7d63345af1b027f2c8026fd15428',
        },
      })
      .then((res) => setCountries(res.data || []))
      .catch(() => setCountries([]));
  }, []);

  // Fetch saved address from the custom session endpoint
  useEffect(() => {
    if (authLoading) {
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
        const savedAddress = shipping || billing;

        if (savedAddress) {
          setAddresses([savedAddress]);
          localStorage.setItem(storageKey, JSON.stringify(savedAddress));
        } else {
          const cachedAddress = getStoredAddress(storageKey);
          setAddresses(cachedAddress ? [cachedAddress] : []);
        }
      })
      .catch(() => {
        const cachedAddress = getStoredAddress(storageKey);
        setAddresses(cachedAddress ? [cachedAddress] : []);
      })
      .finally(() => setLoading(false));
  }, [authLoading, storageKey, userId]);

  // Update cities list if country is AE
  useEffect(() => {
    if (formData.country === 'AE') {
      setCitiesOptions([
        'Abu Dhabi',
        'Dubai',
        'Sharjah',
        'Ajman',
        'Umm Al Quwain',
        'Ras Al Khaimah',
        'Fujairah',
      ]);
    } else {
      setCitiesOptions([]);
      setFormData((prev) => ({ ...prev, city: '' }));
    }
  }, [formData.country]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save address through the custom session endpoint
  const handleSave = async () => {
    if (!userId) {
      alert('User not logged in.');
      return;
    }

    setSaving(true);

    const payload = {
      billing: {
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        address1: formData.street,
        address2: formData.additional,
        city: formData.city,
        state: '',
        postalCode: '',
        country: formData.country,
        phone: formData.phone,
      },
      shipping: {
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        address1: formData.street,
        address2: formData.additional,
        city: formData.city,
        state: '',
        postalCode: '',
        country: formData.country,
      },
    };

    try {
      await axios.post(`${API_BASE}/save-address`, payload, {
        withCredentials: true,
      });

      alert('Address saved successfully.');

      const savedAddress = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        address_1: formData.street,
        address_2: formData.additional,
        city: formData.city,
        state: '',
        country: formData.country,
        phone: formData.phone,
      };

      localStorage.setItem(storageKey, JSON.stringify(savedAddress));
      setAddresses([savedAddress]);

      // Reset form and hide
      setFormData({
        country: '',
        city: '',
        firstName: '',
        lastName: '',
        phone: '',
        isWhatsappSame: 'yes',
        street: '',
        additional: '',
      });
      setShowForm(false);
    } catch (error) {
      console.error(error);
      alert('Failed to save address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  if (loading) {
    return <p className="loading-text">Loading addresses...</p>;
  }

  return (
    <section className="addresses-section">
      <h2 className="section-title">Shipping Addresses</h2>

      {!addresses.length && !showForm && (
        <div className="no-addresses">
          <p className="no-address-text">You don't have any shipping addresses saved.</p>
          <p className="encryption-note">All data you add will be encrypted.</p>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            Add New Address
          </button>
        </div>
      )}

      {addresses.length > 0 && !showForm && (
        <>
          <div className="address-list">
            {addresses.map((addr, idx) => (
              <div className="address-card" key={idx}>
                <p><strong>{addr.first_name} {addr.last_name}</strong></p>
                <p>{addr.address_1}</p>
                {addr.address_2 && <p>{addr.address_2}</p>}
                <p>{addr.city}, {addr.state}</p>
                <p>{addr.country}</p>
                <p>Phone: {addr.phone}</p>
              </div>
            ))}
          </div>
          <button className="btn-primary mt-20" onClick={() => setShowForm(true)}>
            Add Another Address
          </button>
        </>
      )}

      {showForm && (
        <form
          className="address-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!saving) handleSave();
          }}
        >
          <h3 className="form-title">Add New Address</h3>

          <label className="input-label">
            Country / Region <span className="required">*</span>
            <select name="country" value={formData.country} onChange={handleChange} required>
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </label>

          <label className="input-label">
            City / Emirate <span className="required">*</span>
            {citiesOptions.length ? (
              <select name="city" value={formData.city} onChange={handleChange} required>
                <option value="">Select City</option>
                {citiesOptions.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
                required
              />
            )}
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
            Phone Number <span className="required">*</span>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+971 5xxxxxxx"
              required
            />
            <small className="hint">9-digit number starting with 5 for UAE</small>
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
            Street name / Street number / Landmark <span className="required">*</span>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="4A St, Building no, Floor no, Flat no or Landmark"
              required
            />
          </label>

          <label className="input-label">
            Additional / Detailed address (optional)
            <input
              type="text"
              name="additional"
              value={formData.additional}
              onChange={handleChange}
              placeholder="Building no, Floor no, Flat no or Landmark"
            />
          </label>

          <div className="form-buttons">
            <button type="button" className="btn-secondary" onClick={handleCancel} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

export default AddressesSection;
