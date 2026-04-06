export const LOCAL_CARDS_KEY = 'store1920_saved_cards';

export const getUserScopedCardsKey = (userId) =>
  userId ? `${LOCAL_CARDS_KEY}_${userId}` : LOCAL_CARDS_KEY;

export const getStoredCards = (storageKey) => {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to read saved cards from localStorage', error);
    return [];
  }
};

export const getSavedCardsForUser = (userId) => {
  const scopedCards = getStoredCards(getUserScopedCardsKey(userId));
  if (scopedCards.length) return scopedCards;
  return getStoredCards(LOCAL_CARDS_KEY);
};

export const buildSavedCardHint = (card) => {
  if (!card) return null;

  return {
    id: card.id || null,
    brand: card.brand || 'Card',
    last4: card.last4 || '',
    expiry: card.expiry || '',
    cardholderName: card.cardholderName || '',
  };
};
