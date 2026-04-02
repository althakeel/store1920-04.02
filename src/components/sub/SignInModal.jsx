import React, { useRef, useState } from "react";
import axios from "axios";
import "../../assets/styles/SignInModal.css";
import { useAuth } from "../../contexts/AuthContext";
import FacebookIcon from "../../assets/images/facebook.png";
import GoogleSignInButton from '../../components/sub/GoogleSignInButton';


// ===================== Alert Component =====================
const Alert = ({ children, onClose }) => (
  <div className="signin-error-alert">
    <div className="signin-error-content">{children}</div>
    <button onClick={onClose} className="signin-error-close" aria-label="Close alert">
      ×
    </button>
  </div>
);

// ===================== Parse WordPress Error =====================
const parseErrorMsg = (rawMsg) => {
  if (!rawMsg) return null;
  const linkMatch = rawMsg.match(/<a [^>]*>([^<]+)<\/a>/);
  if (linkMatch) {
    const linkText = linkMatch[1];
    const textOnly = rawMsg.replace(/<a[^>]*>[^<]*<\/a>/, "").replace(/<[^>]+>/g, "").trim();
    return (
      <>
        <strong>Error:</strong> {textOnly}{" "}
        <a
          href="https://store1920.com/lost-password"
          target="_blank"
          rel="noopener noreferrer"
          className="signin-lost-password-link"
        >
          {linkText}
        </a>
      </>
    );
  }
  return <>{rawMsg.replace(/<[^>]+>/g, "").trim()}</>;
};

const splitName = (fullName) => {
  const trimmedName = fullName.trim();
  if (!trimmedName) {
    return { firstName: "", lastName: "" };
  }

  const [firstName, ...lastNameParts] = trimmedName.split(/\s+/);
  return {
    firstName,
    lastName: lastNameParts.join(" ") || "User",
  };
};

// ===================== Main Component =====================
const SignInModal = ({ isOpen, onClose, onLogin }) => {
  const { login } = useAuth();
  const formRef = useRef(null);
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const FRONTEND_URL = "https://store1920.com";
  const WP_API = "https://db.store1920.com/wp-json";

  // ===================== Handlers =====================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) {
      setErrorMsg(null);
    }
  };

  const handleForgotPassword = () => {
    onClose();
    window.location.href = `${FRONTEND_URL}/lost-password`;
  };

  // ===================== Validation =====================
  const validateRegister = (values) => {
    if (!values.name.trim()) return setErrorMsg("Name is required"), false;
    if (!values.email.trim()) return setErrorMsg("Email is required"), false;
    if (!values.phone.trim()) return setErrorMsg("Phone number is required"), false;
    if (!values.password) return setErrorMsg("Password is required"), false;
    if (values.password !== values.confirmPassword)
      return setErrorMsg("Passwords do not match"), false;
    setErrorMsg(null);
    return true;
  };

  const validateLogin = (values) => {
    if (!values.email.trim()) return setErrorMsg("Email is required"), false;
    if (!values.password) return setErrorMsg("Password is required"), false;
    setErrorMsg(null);
    return true;
  };

  const getFormValues = () => {
    if (!formRef.current) {
      return formData;
    }

    const formValues = new FormData(formRef.current);
    return {
      name: (formValues.get("name") || "").toString().trim(),
      email: (formValues.get("email") || "").toString().trim(),
      password: (formValues.get("password") || "").toString(),
      confirmPassword: (formValues.get("confirmPassword") || "").toString(),
      phone: (formValues.get("phone") || "").toString().trim(),
    };
  };

  // ===================== API Calls =====================
  const registerUser = async (values) => {
    if (!validateRegister(values)) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const registerRes = await axios.post(`${WP_API}/custom/v2/register`, {
        email: values.email,
        password: values.password,
        name: values.name,
        phone: values.phone,
      });

      if (!registerRes.data?.success) {
        const msg = registerRes.data?.message || "Registration failed";
        const code = registerRes.data?.code || "";
        if (code === "email_exists") {
          setErrorMsg("This email is already registered. Please sign in instead.");
        } else {
          setErrorMsg(msg);
        }
        return;
      }

      const res = registerRes.data;

      // Token is generated server-side in the register endpoint to bypass OTP interceptors
      const userInfo = {
        name: values.name,
        image: "",
        token: res.token || "wordpress_session",
        id: res.id || res.user_id,
        email: values.email,
        user: res,
      };
      login(userInfo);
      localStorage.setItem("userId", userInfo.id);
      localStorage.setItem("email", userInfo.email);
      localStorage.setItem("token", userInfo.token);
      onLogin?.(userInfo);
      onClose();
    } catch (err) {
      setErrorMsg(parseErrorMsg(err.message || err?.data?.message || err?.message || "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (values) => {
    if (!validateLogin(values)) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await axios.post(`${WP_API}/jwt-auth/v1/token`, {
        username: values.email,
        password: values.password,
      });

      if (res.data?.token) {
        const profileRes = await axios.get(`${WP_API}/wp/v2/users/me`, {
          headers: { Authorization: `Bearer ${res.data.token}` },
        });

        const userInfo = {
          name: profileRes.data.name || values.email,
          image: "",
          token: res.data.token,
          id: profileRes.data.id,
          email: values.email,
          user: profileRes.data,
        };

        login(userInfo);
        localStorage.setItem("userId", userInfo.id);
        localStorage.setItem("email", userInfo.email);
        localStorage.setItem("token", userInfo.token);
        onLogin?.(userInfo);
        onClose();
      } else {
        setErrorMsg("Invalid login credentials");
      }
    } catch (err) {
      setErrorMsg(parseErrorMsg(err.response?.data?.message || "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  // ===================== Social Login (WordPress Nextend) =====================
  const handleSocialLogin = (provider) => {
    const baseUrl = "https://db.store1920.com/wp-login.php?loginSocial=";
    window.location.href = `${baseUrl}${provider}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const values = getFormValues();
    setFormData(values);
    isRegister ? registerUser(values) : loginUser(values);
  };

  if (!isOpen) return null;

  // ===================== Render =====================
  return (
    <>
      <div className="signin-modal-overlay" onClick={onClose} />
      <div className="signin-modal-container" role="dialog" aria-modal="true">
        <button className="signin-modal-close" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        <div className="signin-modal-header">
          <h2 className="signin-modal-title">Sign in / Register</h2>
          <div className="signin-security">🔒 All data will be encrypted</div>

          <div className="signin-benefits">
            <div className="benefit-item">
              🚚 Free shipping <span className="benefit-subtext">Special for you</span>
            </div>
            <div className="benefit-item">
              ↩ Free returns <span className="benefit-subtext">Up to 90 days</span>
            </div>
          </div>
        </div>

        <form ref={formRef} className="signin-modal-form" onSubmit={handleSubmit} noValidate>
          {errorMsg && <Alert onClose={() => setErrorMsg(null)}>{errorMsg}</Alert>}

          {isRegister && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full name"
                value={formData.name}
                onChange={handleChange}
                className="signin-modal-input"
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone number"
                value={formData.phone}
                onChange={handleChange}
                className="signin-modal-input"
                required
              />
            </>
          )}

          <input
            type="text"
            name="email"
            placeholder={isRegister ? "Email address" : "Email or phone number"}
            value={formData.email}
            onChange={handleChange}
            className="signin-modal-input"
            required
          />

          {!isRegister && (
            <>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="signin-modal-input"
                required
              />
              <div className="signin-show-password">
                <label>
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                  />
                  Show password
                </label>
              </div>
            </>
          )}

          {isRegister && (
            <>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="signin-modal-input"
                required
              />
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="signin-modal-input"
                required
              />
              <div className="signin-show-password">
                <label>
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                  />
                  Show password
                </label>
              </div>
            </>
          )}

          <button type="submit" className="signin-submit-btn" disabled={loading}>
            {loading ? "Please wait..." : isRegister ? "Register" : "Continue"}
          </button>
        </form>

        {!isRegister && (
          <div className="signin-forgot-password-text" onClick={handleForgotPassword}>
            Trouble signing in?
          </div>
        )}

        <div className="signin-divider">
          <span>Or continue with</span>
        </div>

        <div className="signin-social-icons">
          <GoogleSignInButton onLogin={(userInfo) => {
            onLogin?.(userInfo);
            onClose();
          }} />

          <button onClick={() => handleSocialLogin("facebook")}>
            <img src={FacebookIcon} alt="Facebook" />
          </button>
          <button disabled>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
              alt="Apple"
              width="30px"
              height="50px"
            />
          </button>
        </div>

        <div className="signin-terms">
          By continuing, you agree to our{" "}
          <a href="/terms-0f-use">Terms</a> and <a href="/privacy-policy">Privacy Policy</a>.
        </div>

        <div className="signin-toggle-text">
          {isRegister ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="signin-toggle-link"
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="signin-toggle-link"
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SignInModal;
