import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import "../../assets/styles/SignInModal.css";
import { useAuth } from "../../contexts/AuthContext";
import GoogleSignInButton from '../../components/sub/GoogleSignInButton';
import FacebookSignInButton from "../../components/sub/FacebookSignInButton";

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

// ===================== Main Component =====================
const SignInModal = ({ isOpen, onClose, onLogin }) => {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [pendingRegistration, setPendingRegistration] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const FRONTEND_URL = "https://store1920.com";
  const WP_API = "https://db.store1920.com/wp-json";
  const isSignInMode = !isRegister;
  const isOtpStep = isRegister && (otpSent || Boolean(pendingRegistration));
  const shouldHideOtpErrorInSignIn =
    isSignInMode &&
    typeof errorMsg === "string" &&
    (/otp/i.test(errorMsg) || /attempts left/i.test(errorMsg));

  useEffect(() => {
    if (!isOpen) return undefined;

    setIsRegister(false);
    setPendingRegistration(null);
    setOtp("");
    setOtpSent(false);
    setOtpMessage("");
    setSuccessMsg("");
    setErrorMsg(null);
    setShowPassword(false);

    document.body.dataset.signinModalOpen = "true";

    return () => {
      delete document.body.dataset.signinModalOpen;
    };
  }, [isOpen]);

  // ===================== Handlers =====================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) {
      setErrorMsg(null);
    }
  };

  const resetRegisterFlow = () => {
    setPendingRegistration(null);
    setOtp("");
    setOtpSent(false);
    setOtpMessage("");
    setErrorMsg(null);
  };

  const switchToLoginMode = (message = "") => {
    resetRegisterFlow();
    setIsRegister(false);
    setShowPassword(false);
    setSuccessMsg(message);
    setOtpMessage("");
  };

  const switchToRegisterMode = () => {
    resetRegisterFlow();
    setIsRegister(true);
    setSuccessMsg("");
  };

  const moveToLoginAfterVerification = (message) => {
    switchToLoginMode(message || "Email verified successfully. Please sign in.");
  };

  const handleForgotPassword = () => {
    onClose();
    window.location.href = `${FRONTEND_URL}/lost-password`;
  };

  // ===================== Validation =====================
  const validateRegister = () => {
    if (!formData.name.trim()) {
      setErrorMsg("Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setErrorMsg("Email is required");
      return false;
    }
    // if (!formData.phone.trim()) {
    //   setErrorMsg("Phone number is required");
    //   return false;
    // }
    if (!formData.password) {
      setErrorMsg("Password is required");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match");
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  const loginAfterRegistration = async () => {
    const registrationData = pendingRegistration || formData;
    try {
      const loginRes = await axios.post(`${WP_API}/jwt-auth/v1/token`, {
        username: registrationData.email,
        password: registrationData.password,
      });

      if (loginRes.data?.token) {
        const userInfo = {
          name: registrationData.name,
          image: "",
          token: loginRes.data.token,
          id: loginRes.data.user_id || loginRes.data.id || null,
          email: registrationData.email,
          user: loginRes.data,
        };
        login(userInfo);
        localStorage.setItem("userId", userInfo.id);
        localStorage.setItem("email", userInfo.email);
        localStorage.setItem("token", userInfo.token);
        onLogin?.(userInfo);
        onClose();
        return true;
      }
    } catch (error) {
      console.warn("Auto login after registration failed", error);
    }

    moveToLoginAfterVerification("Email verified successfully. Please sign in.");
    return false;
  };

  const validateLogin = () => {
    if (!formData.email.trim()) {
      setErrorMsg("Email is required");
      return false;
    }
    if (!formData.password) {
      setErrorMsg("Password is required");
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  // ===================== API Calls =====================
  const sendEmailOtp = async () => {
    if (isOtpStep) {
      await verifyEmailOtp();
      return;
    }

    if (!validateRegister()) return;
    const registrationData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      phone: formData.phone.trim(),
    };
    setLoading(true);
    setErrorMsg(null);
    setOtpMessage("");
    setSuccessMsg("");

    try {
      const res = await axios.post(`${WP_API}/custom/v1/send-email-otp`, {
        name: registrationData.name,
        email: registrationData.email,
        password: registrationData.password,
        phone: registrationData.phone,
      });
      setPendingRegistration(registrationData);
      setOtpSent(true);
      setOtpMessage(res.data?.message || "OTP sent to your email.");
    } catch (err) {
      setErrorMsg(parseErrorMsg(err.response?.data?.message || "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailOtp = async () => {
    if (!otp.trim()) {
      setErrorMsg("OTP is required");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg("");

    try {
      const res = await axios.post(`${WP_API}/custom/v1/verify-email-otp`, {
        email: pendingRegistration?.email || formData.email,
        otp: otp.trim(),
      });

      const verifyMessage = res.data?.message || "Email verified successfully.";
      setOtpMessage(verifyMessage);
      await loginAfterRegistration();
    } catch (err) {
      const attemptsLeft = err.response?.data?.data?.attempts_left;
      const baseMessage = err.response?.data?.message || "OTP verification failed";
      if (typeof attemptsLeft === "number") {
        setErrorMsg(`${baseMessage}. Attempts left: ${attemptsLeft}`);
      } else {
        setErrorMsg(parseErrorMsg(baseMessage));
      }
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async () => {
    switchToLoginMode();
    if (!validateLogin()) return;
    setLoading(true);
    setErrorMsg(null);
    setOtpMessage("");
    setSuccessMsg("");

    try {
      const res = await axios.post(`${WP_API}/jwt-auth/v1/token`, {
        username: formData.email,
        password: formData.password,
      });

      if (res.data?.token) {
        const profileRes = await axios.get(`${WP_API}/wp/v2/users/me`, {
          headers: { Authorization: `Bearer ${res.data.token}` },
        });

        const userInfo = {
          name: profileRes.data.name || formData.email,
          image: "",
          token: res.data.token,
          id: profileRes.data.id,
          email: formData.email,
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignInMode) {
      loginUser();
      return;
    }
    if (isRegister) {
      if (isOtpStep) {
        verifyEmailOtp();
      } else {
        sendEmailOtp();
      }
      return;
    }
  };

  if (!isOpen) return null;

  // ===================== Render =====================
  return ReactDOM.createPortal(
    <>
      <div className="signin-modal-overlay" onClick={onClose} />
      <div
        className="signin-modal-container"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
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

        <form className="signin-modal-form" onSubmit={handleSubmit} noValidate>
          {errorMsg && !shouldHideOtpErrorInSignIn && (
            <Alert onClose={() => setErrorMsg(null)}>{errorMsg}</Alert>
          )}
          {successMsg && (
            <div className="signin-success-alert">
              <div className="signin-success-content">{successMsg}</div>
            </div>
          )}
          {isRegister && otpMessage && (
            <div className="signin-success-alert">
              <div className="signin-success-content">{otpMessage}</div>
            </div>
          )}

          <input
            type="text"
            name="email"
            placeholder="Email or phone number"
            value={formData.email}
            onChange={handleChange}
            className="signin-modal-input"
            required={!isOtpStep}
            disabled={isOtpStep}
          />

          {isSignInMode && (
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
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="signin-modal-input"
                required={!isOtpStep}
                disabled={isOtpStep}
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="signin-modal-input"
                required={!isOtpStep}
                disabled={isOtpStep}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="signin-modal-input"
                required={!isOtpStep}
                disabled={isOtpStep}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="signin-modal-input"
                required={!isOtpStep}
                disabled={isOtpStep}
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
              {isOtpStep && (
                <>
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter Email OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="signin-modal-input"
                    required
                  />
                  <button
                    type="button"
                    className="signin-secondary-btn"
                    onClick={sendEmailOtp}
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                  <button
                    type="button"
                    className="signin-secondary-link-btn"
                    onClick={() => {
                      resetRegisterFlow();
                    }}
                    disabled={loading}
                  >
                    Change email or details
                  </button>
                </>
              )}
            </>
          )}

          <button
            type={isRegister ? "button" : "submit"}
            className="signin-submit-btn"
            disabled={loading}
            onClick={isRegister ? () => (isOtpStep ? verifyEmailOtp() : sendEmailOtp()) : undefined}
          >
            {loading
              ? "Please wait..."
              : isRegister
                ? isOtpStep
                  ? "Verify OTP"
                  : "Send OTP"
                : "Continue"}
          </button>
        </form>

        {isSignInMode && (
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
          <FacebookSignInButton onLogin={(userInfo) => {
            onLogin?.(userInfo);
            onClose();
          }} />
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
                onClick={() => {
                  switchToLoginMode();
                }}
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
                onClick={() => {
                  switchToRegisterMode();
                }}
                className="signin-toggle-link"
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};

export default SignInModal;
