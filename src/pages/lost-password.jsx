import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const resetKey = searchParams.get('key') || '';
  const resetLogin = searchParams.get('login') || '';
  const isResetMode = useMemo(() => Boolean(resetKey && resetLogin), [resetKey, resetLogin]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!identifier) {
      setError('Please enter your email or mobile number.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('https://db.store1920.com/wp-json/custom/v1/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Reset failed.');
      } else {
        setMessage('A reset link has been sent to your email.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('https://db.store1920.com/wp-json/custom/v1/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: resetKey,
          login: resetLogin,
          password: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Unable to reset password.');
      } else {
        setMessage('Your password has been reset successfully. You can now sign in with your new password.');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    maxWidth: 1400,
    margin: '20px auto 40px',
    minHeight: '40vh',
    padding: isMobile ? 15 : 20,
    fontFamily: "'Montserrat', sans-serif",
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#fff',
  };

  const cardStyle = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? 25 : 40,
    background: '#fff',
    borderRadius: 12,
    padding: isMobile ? 25 : 40,
  };

  const leftStyle = {
    flex: '1',
    minWidth: 320,
  };

  const rightStyle = {
    flex: '1',
    minWidth: 320,
    color: '#444',
    fontSize: isMobile ? 14 : 15,
    lineHeight: 1.7,
    marginTop: isMobile ? 30 : 0,
  };

  const headingStyle = {
    fontSize: isMobile ? 22 : 26,
    marginBottom: 10,
    color: '#333',
  };

  const subHeadingStyle = {
    fontSize: isMobile ? 18 : 20,
    marginBottom: 15,
    color: '#222',
  };

  const paragraphStyle = {
    color: '#666',
    marginBottom: 25,
    fontSize: isMobile ? 14 : 16,
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
  };

  const inputStyle = {
    padding: 12,
    border: '1px solid #ccc',
    borderRadius: 8,
    fontSize: isMobile ? 14 : 16,
    marginBottom: 20,
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const buttonStyle = {
    padding: 12,
    backgroundColor: loading ? '#555' : '#aa4d00ff',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 'bold',
    fontSize: isMobile ? 14 : 16,
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.3s ease',
  };

  const messageSuccessStyle = {
    marginTop: 15,
    fontSize: isMobile ? 14 : 15,
    color: 'green',
  };

  const messageErrorStyle = {
    marginTop: 15,
    fontSize: isMobile ? 14 : 15,
    color: 'red',
  };

  const listStyle = {
    paddingLeft: 20,
    marginBottom: 30,
  };

  const listItemStyle = {
    marginBottom: 10,
    position: 'relative',
    paddingLeft: 20,
    listStyle: 'none',
  };

  const bulletStyle = {
    position: 'absolute',
    left: 0,
    color: '#0073aa',
    fontWeight: 'bold',
  };

  const noteStyle = {
    borderLeft: '4px solid #0073aa',
    background: '#f5f8fa',
    padding: 15,
    borderRadius: 6,
  };

  const noteHeadingStyle = {
    marginBottom: 8,
    color: '#0073aa',
    fontSize: isMobile ? 16 : 18,
  };

  const linkStyle = {
    color: '#aa4d00ff',
    fontWeight: 600,
    textDecoration: 'none',
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={leftStyle}>
          <h2 style={headingStyle}>{isResetMode ? 'Reset Password' : 'Forgot Password'}</h2>
          <p style={paragraphStyle}>
            {isResetMode
              ? 'Enter your new password below to finish resetting your account password.'
              : "Enter your registered email or phone number. We'll send you a reset link."}
          </p>

          {isResetMode ? (
            <form onSubmit={handlePasswordReset} style={formStyle}>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#0073aa')}
                onBlur={(e) => (e.target.style.borderColor = '#ccc')}
                disabled={loading}
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#0073aa')}
                onBlur={(e) => (e.target.style.borderColor = '#ccc')}
                disabled={loading}
              />
              <button type="submit" disabled={loading} style={buttonStyle}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetRequest} style={formStyle}>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Email or mobile number"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#0073aa')}
                onBlur={(e) => (e.target.style.borderColor = '#ccc')}
                disabled={loading}
              />
              <button type="submit" disabled={loading} style={buttonStyle}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          {message && <p style={messageSuccessStyle}>{message}</p>}
          {error && <p style={messageErrorStyle}>{error}</p>}

          {isResetMode && (
            <p style={{ marginTop: 16, fontSize: isMobile ? 13 : 14, color: '#666' }}>
              <Link to="/lost-password" style={linkStyle}>
                Request a new reset link
              </Link>
            </p>
          )}
        </div>

        <div style={rightStyle}>
          <h3 style={subHeadingStyle}>Rules & Instructions</h3>
          <ul style={listStyle}>
            <li style={listItemStyle}>
              <span style={bulletStyle}>•</span>
              Make sure your email or mobile number is registered.
            </li>
            <li style={listItemStyle}>
              <span style={bulletStyle}>•</span>
              Reset links are valid for 1 hour.
            </li>
            <li style={listItemStyle}>
              <span style={bulletStyle}>•</span>
              Check spam/junk if you don&apos;t receive the email.
            </li>
            <li style={listItemStyle}>
              <span style={bulletStyle}>•</span>
              For help, contact{' '}
              <a href="mailto:support@store1920.com" style={{ color: '#0073aa' }}>
                support@store1920.com
              </a>
            </li>
          </ul>

          <div style={noteStyle}>
            <h4 style={noteHeadingStyle}>Need further assistance?</h4>
            <p>
              You can always reach out to our support team for manual assistance with account recovery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
