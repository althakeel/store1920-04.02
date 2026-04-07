export const CHECKOUT_FORM_STORAGE_KEY = 'checkoutFormData';
export const ACCOUNT_ADDRESS_STORAGE_KEY = 'store1920_saved_address';

export const UAE_EMIRATES = [
  { code: 'AUH', name: 'Abu Dhabi' },
  { code: 'AAN', name: 'Al Ain' },
  { code: 'DXB', name: 'Dubai' },
  { code: 'SHJ', name: 'Sharjah' },
  { code: 'AJM', name: 'Ajman' },
  { code: 'UAQ', name: 'Umm Al Quwain' },
  { code: 'RAK', name: 'Ras Al Khaimah' },
  { code: 'FUJ', name: 'Fujairah' },
];

export const createEmptyCheckoutFormData = () => ({
  shipping: {
    first_name: '',
    last_name: '',
    email: '',
    street: '',
    apartment: '',
    floor: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'AE',
    phone_prefix: '50',
    phone_number: '',
    delivery_type: 'Home',
  },
  billing: {
    first_name: '',
    last_name: '',
    email: '',
    street: '',
    apartment: '',
    floor: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'AE',
    phone_prefix: '50',
    phone_number: '',
  },
  billingSameAsShipping: true,
  paymentMethod: 'cod',
  paymentMethodTitle: 'Cash On Delivery',
  paymentMethodLogo: null,
  selectedSavedCardId: null,
  selectedSavedCardHint: null,
  shippingMethodId: null,
  saveAsDefault: false,
});

export const getUserScopedAddressKey = (userId) =>
  userId ? `${ACCOUNT_ADDRESS_STORAGE_KEY}_${userId}` : ACCOUNT_ADDRESS_STORAGE_KEY;

const createAddressId = () => `addr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const normalizeAccountAddress = (address = {}) => {
  if (!address || typeof address !== 'object') return null;

  const normalized = {
    id: address.id || createAddressId(),
    first_name: address.first_name || address.firstName || '',
    last_name: address.last_name || address.lastName || '',
    email: address.email || '',
    phone: address.phone || '',
    address_1: address.address_1 || address.address1 || address.street || '',
    address_2: address.address_2 || address.address2 || '',
    apartment: address.apartment || address.address_2 || address.address2 || '',
    floor: address.floor || '',
    city: address.city || '',
    state: address.state || '',
    country: address.country || 'AE',
    postal_code: address.postal_code || address.postcode || address.postalCode || '',
    delivery_type: address.delivery_type || 'Home',
    saveAsDefault: Boolean(address.saveAsDefault),
  };

  if (!normalized.address_1) return null;

  return normalized;
};

export const readAddressBook = (storageKey) => {
  const raw = readJsonStorage(storageKey);

  if (!raw) {
    return {
      addresses: [],
      preferredAddressId: null,
    };
  }

  if (Array.isArray(raw)) {
    const addresses = raw.map(normalizeAccountAddress).filter(Boolean);
    return {
      addresses,
      preferredAddressId:
        addresses.find((address) => address.saveAsDefault)?.id || addresses[0]?.id || null,
    };
  }

  if (Array.isArray(raw.addresses)) {
    const addresses = raw.addresses.map(normalizeAccountAddress).filter(Boolean);
    const preferredAddressId =
      raw.preferredAddressId && addresses.some((address) => address.id === raw.preferredAddressId)
        ? raw.preferredAddressId
        : addresses.find((address) => address.saveAsDefault)?.id || addresses[0]?.id || null;

    return {
      addresses: addresses.map((address) => ({
        ...address,
        saveAsDefault: address.id === preferredAddressId,
      })),
      preferredAddressId,
    };
  }

  const singleAddress = normalizeAccountAddress(raw);
  return {
    addresses: singleAddress ? [{ ...singleAddress, saveAsDefault: true }] : [],
    preferredAddressId: singleAddress?.id || null,
  };
};

export const writeAddressBook = (storageKey, addresses = [], preferredAddressId = null) => {
  const normalizedAddresses = addresses
    .map(normalizeAccountAddress)
    .filter(Boolean);

  const resolvedPreferredId =
    preferredAddressId && normalizedAddresses.some((address) => address.id === preferredAddressId)
      ? preferredAddressId
      : normalizedAddresses[0]?.id || null;

  const payload = {
    addresses: normalizedAddresses.map((address) => ({
      ...address,
      saveAsDefault: address.id === resolvedPreferredId,
    })),
    preferredAddressId: resolvedPreferredId,
  };

  localStorage.setItem(storageKey, JSON.stringify(payload));
  return payload;
};

export const getPreferredAddress = (addressBook = {}) => {
  const addresses = Array.isArray(addressBook.addresses) ? addressBook.addresses : [];
  return (
    addresses.find((address) => address.id === addressBook.preferredAddressId) ||
    addresses.find((address) => address.saveAsDefault) ||
    addresses[0] ||
    null
  );
};

export const normalizeStoredPhone = (phoneValue = '') => {
  let digits = String(phoneValue || '').replace(/\D/g, '');

  if (digits.startsWith('971')) digits = digits.slice(3);
  if (digits.startsWith('0')) digits = digits.slice(1);

  return {
    phone_prefix: digits.slice(0, 2) || '50',
    phone_number: digits.slice(0, 9),
  };
};

export const mapAccountAddressToCheckoutForm = (address = {}, fallbackEmail = '') => {
  const base = createEmptyCheckoutFormData();
  const phone = normalizeStoredPhone(address.phone);

  const shipping = {
    ...base.shipping,
    first_name: address.first_name || '',
    last_name: address.last_name || '',
    email: address.email || fallbackEmail || '',
    street: address.address_1 || address.street || '',
    apartment: address.apartment || address.address_2 || '',
    floor: address.floor || '',
    city: address.city || '',
    state: address.state || '',
    postal_code: address.postal_code || address.postcode || '',
    country: address.country || 'AE',
    phone_prefix: phone.phone_prefix,
    phone_number: phone.phone_number,
    delivery_type: address.delivery_type || 'Home',
  };

  return {
    ...base,
    shipping,
    billing: {
      ...base.billing,
      ...shipping,
    },
    selectedAddressId: address.id || null,
    saveAsDefault: Boolean(address.saveAsDefault),
  };
};

export const mapCheckoutFormToAccountAddress = (checkoutData = {}) => {
  const shipping = checkoutData?.shipping || {};

  return {
    id: checkoutData?.selectedAddressId || null,
    first_name: shipping.first_name || '',
    last_name: shipping.last_name || '',
    email: shipping.email || '',
    phone: `+971${shipping.phone_number || ''}`,
    address_1: shipping.street || '',
    address_2: shipping.apartment || '',
    apartment: shipping.apartment || '',
    floor: shipping.floor || '',
    city: shipping.city || '',
    state: shipping.state || '',
    country: shipping.country || 'AE',
    postal_code: shipping.postal_code || '',
    delivery_type: shipping.delivery_type || 'Home',
    saveAsDefault: Boolean(checkoutData?.saveAsDefault),
  };
};

export const readJsonStorage = (storageKey) => {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error(`Failed to read localStorage key "${storageKey}"`, error);
    return null;
  }
};
