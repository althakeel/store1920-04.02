// src/constants/accountMenu.js

import {
  AiOutlineShoppingCart,
  AiOutlineUser,
  AiOutlineGift,
  AiOutlineCreditCard,
  AiOutlineHistory,
  AiOutlineHome,
} from 'react-icons/ai';

const accountMenu = [
  { label: 'All orders', slug: 'orders', icon: <AiOutlineShoppingCart /> },
  { label: 'Your profile', slug: 'profile', icon: <AiOutlineUser /> },
  { label: 'Coupons & offers', slug: 'coupons', icon: <AiOutlineGift /> },
  { label: 'Browsing history', slug: 'history', icon: <AiOutlineHistory /> },
  // { label: 'Credit balance', slug: 'credit-balance', icon: <AiOutlineCreditCard /> },
  // { label: 'Followed stores', slug: 'followed-stores', icon: <AiOutlineHeart /> },
  { label: 'Addresses', slug: 'addresses', icon: <AiOutlineHome /> },
  // { label: 'Country/Region & Language', slug: 'country-region-language', icon: <AiOutlineGlobal /> },
  { label: 'Your payment methods', slug: 'payment-methods', icon: <AiOutlineCreditCard /> },
];

export default accountMenu;
