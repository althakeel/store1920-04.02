import React, { useRef, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../utils/firebase";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import GoogleIcon from '../../assets/images/search.png'; 




const GoogleSignInButton = ({ onLogin }) => {
  const { login } = useAuth();
  const signingInRef = useRef(false);
  const [loading, setLoading] = useState(false);

 const inFlight = useRef(false);
 

const handleGoogleSignIn = async () => {
  if (inFlight.current) {
    console.warn("Google login already in progress");
    return;
  }

  inFlight.current = true;

  try {
    const result = await signInWithPopup(auth, googleProvider);

    await axios.post(
      "https://db.store1920.com/wp-json/custom/v1/google-login",
      {
        email: result.user.email,
        name: result.user.displayName,
        firebase_uid: result.user.uid,
        photo_url: result.user.photoURL,
      },
      {
        timeout: 10000,
      }
    );

  } catch (err) {
    console.error(err);
  } finally {
    // ⛔ release lock ONLY after everything finishes
    inFlight.current = false;
  }
};


  return (
    <button
      className="google-signin-btn"
      onClick={handleGoogleSignIn}
      disabled={loading}
      style={{ opacity: loading ? 0.6 : 1 }}
    >
      <img src={GoogleIcon} width={24} height={24} />
    </button>
  );
};


export default GoogleSignInButton;
