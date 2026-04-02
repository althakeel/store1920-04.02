import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Sidebar from '../components/sub/account/Sidebar';
import OrderSection from '../components/sub/account/sections/OrderSection';
import ReviewsSection from '../components/sub/account/sections/ReviewsSection';
import ProfileSection from '../components/sub/account/sections/ProfileSection';
import CouponsSection from '../components/sub/account/sections/CouponsSection';
import BrowsingHistorySection from '../components/sub/account/sections/BrowsingHistorySection';
import AddressesSection from '../components/sub/account/sections/AddressesSection';
import PaymentMethodsSection from '../components/sub/account/sections/PaymentMethodsSection';
import ProductsUnder20AED from '../components/ProductsUnder20AED';

import { useAuth } from '../contexts/AuthContext';

import '../assets/styles/myaccount.css';

const MyAccount = () => {
  const { user } = useAuth();

  // const [coinBalance, setCoinBalance] = useState(0);
  // const [coinHistory, setCoinHistory] = useState([]);
  // const [loadingCoins, setLoadingCoins] = useState(false);
  // const [coinError, setCoinError] = useState(null);

  const userId = user?.id;
  const email = user?.email;

  // 🔐 COINS: WordPress session based
  // useEffect(() => {
  //   if (!user || !email) {
  //     setCoinBalance(0);
  //     setCoinHistory([]);
  //     return;
  //   }

  //   const fetchCoins = async () => {
  //     setLoadingCoins(true);
  //     setCoinError(null);

  //     try {
  //       // 1️⃣ LOGIN USER INTO WORDPRESS
  //       await axios.post(
  //         'https://db.store1920.com/wp-json/custom/v3/login-by-email',
  //         { email },
  //         { withCredentials: true }
  //       );

  //       // 2️⃣ FETCH COINS (COOKIE AUTH)
  //       const res = await axios.get(
  //         'https://db.store1920.com/wp-json/custom/v3/coins',
  //         { withCredentials: true }
  //       );

  //       if (res.data.success) {
  //         setCoinBalance(res.data.balance || 0);
  //         setCoinHistory(res.data.history || []);
  //       } else {
  //         throw new Error('Invalid coin response');
  //       }

  //     } catch (err) {
  //       console.error('Failed to fetch coin data:', err);
  //       setCoinError('Failed to load coin data');
  //       setCoinBalance(0);
  //       setCoinHistory([]);
  //     } finally {
  //       setLoadingCoins(false);
  //     }
  //   };

  //   fetchCoins();
  // }, [user, email]);

  return (
    <div className="account-wrapper">
      <div className="account-layout">
        <Sidebar />

        <main className="account-main">
          <Routes>
            <Route path="orders" element={<OrderSection userId={userId} />} />
            <Route path="reviews" element={<ReviewsSection customerEmail={email} />} />
            <Route path="profile" element={<ProfileSection userId={userId} />} />
            <Route path="coupons" element={<CouponsSection />} />
            <Route path="history" element={<BrowsingHistorySection customerEmail={email} />} />
            <Route path="browsing-history" element={<Navigate to="/myaccount/history" replace />} />
            <Route path="addresses" element={<AddressesSection />} />
            <Route path="payment-methods" element={<PaymentMethodsSection />} />
            <Route path="account-security" element={<Navigate to="/myaccount/orders" replace />} />
            <Route path="permissions" element={<Navigate to="/myaccount/orders" replace />} />
            <Route path="notifications" element={<Navigate to="/myaccount/orders" replace />} />
            <Route path="" element={<Navigate to="orders" replace />} />
          </Routes>
        </main>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
        <ProductsUnder20AED />
      </div>
    </div>
  );
};

export default MyAccount;
