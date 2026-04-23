import staticProducts from '../data/staticProducts';

const normalizeId = (value) => {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  return normalized ? normalized : null;
};

const staticProductIds = new Set();

staticProducts.forEach((product) => {
  [
    product?.id,
    product?.wooId,
    ...(Array.isArray(product?.bundles)
      ? product.bundles.flatMap((bundle) => [bundle?.id, bundle?.wooId])
      : []),
  ]
    .map(normalizeId)
    .filter(Boolean)
    .forEach((id) => staticProductIds.add(id));
});

export const isStaticCartItem = (item) => {
  if (!item) return false;
  if (item.isStaticProduct === true) return true;

  return [item.id, item.productId, item.wooId]
    .map(normalizeId)
    .filter(Boolean)
    .some((id) => staticProductIds.has(id));
};

export const cartHasDynamicProducts = (cartItems = []) =>
  cartItems.some((item) => !isStaticCartItem(item));

export const getCartItemDisplayName = (item) => {
  if (!item) return '';

  const rawName = String(item.displayName || item.name || item.title || '').trim();
  const rawBundleType = String(item.bundleType || '').trim();

  if (!rawBundleType) {
    return rawName;
  }

  if (!rawName) {
    return rawBundleType;
  }

  if (rawName.toLowerCase().includes(rawBundleType.toLowerCase())) {
    return rawName;
  }

  return `${rawName} - ${rawBundleType}`;
};
