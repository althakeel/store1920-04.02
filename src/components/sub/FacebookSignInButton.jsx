import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, facebookProvider } from "../../utils/firebase";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import FacebookIcon from "../../assets/images/facebook.png";

let FACEBOOK_LOGIN_IN_PROGRESS = false;

const FacebookSignInButton = ({ onLogin }) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleFacebookSignIn = async () => {
    if (FACEBOOK_LOGIN_IN_PROGRESS) return;

    FACEBOOK_LOGIN_IN_PROGRESS = true;
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;

      if (!user.email) {
        throw new Error("Facebook account did not return an email address.");
      }

      const res = await axios.post(
        "https://db.store1920.com/wp-json/custom/v1/facebook-login",
        {
          email: user.email,
          name: user.displayName || user.email.split("@")[0],
          firebase_uid: user.uid,
          photo_url: user.photoURL,
        },
        { timeout: 10000 }
      );

      const userInfo = {
        id: res.data.id || user.uid,
        name: user.displayName || user.email.split("@")[0],
        email: user.email,
        token: res.data.token || "firebase-only",
        image: user.photoURL,
        photoURL: user.photoURL,
        firebaseUid: user.uid,
      };

      localStorage.setItem("token", userInfo.token);
      localStorage.setItem("userId", userInfo.id);
      localStorage.setItem("email", userInfo.email);

      login(userInfo);
      onLogin?.(userInfo);
    } catch (err) {
      if (err?.response?.status === 429) {
        alert("Please wait a few seconds and try again.");
      } else if (err?.message?.includes("email address")) {
        alert("Facebook did not return your email. Please allow email access or use another sign-in method.");
      } else {
        console.error("Facebook login failed:", err);
        alert("Facebook login failed. Please try again.");
      }
    } finally {
      setTimeout(() => {
        FACEBOOK_LOGIN_IN_PROGRESS = false;
        setLoading(false);
      }, 3000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleFacebookSignIn}
      disabled={loading}
      style={{
        opacity: loading ? 0.6 : 1,
        cursor: loading ? "not-allowed" : "pointer",
      }}
      aria-label="Continue with Facebook"
    >
      <img src={FacebookIcon} alt="Facebook" />
    </button>
  );
};

export default FacebookSignInButton;
