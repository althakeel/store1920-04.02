import React, { useState } from "react";

const Careers = () => {
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#f9f9f9",
        minHeight: "50vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "0",
      }}
    >
      <div style={{ width: "100%", maxWidth: "600px" }}>
        <h2 style={{ textAlign: "center", color: "#222", margin: "32px 0 12px 0" }}>Careers at Store1920</h2>
        <div style={{ textAlign: "center", color: "#555", fontSize: "1rem", marginBottom: "18px" }}>
          Interested in joining Store1920? Send us your details and we will get back to you.
        </div>
        <form onSubmit={handleSubmit} style={{ width: "100%", padding: "0 12px" }}>
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", marginBottom: "6px", textAlign: "left" }}>Name:</label>
            <input
              type="text"
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              placeholder="Your name"
              required
            />
          </div>
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", marginBottom: "6px", textAlign: "left" }}>Email:</label>
            <input
              type="email"
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              placeholder="Your email"
              required
            />
          </div>
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", marginBottom: "6px", textAlign: "left" }}>Message:</label>
            <textarea
              rows="4"
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", resize: "none" }}
              placeholder="Tell us about yourself"
              required
            />
          </div>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              background: "#007BFF",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Send
          </button>
        </form>
        {success && (
          <div style={{ marginTop: "18px", textAlign: "center", color: "#28a745", fontWeight: "bold" }}>
            Message sent successfully!
          </div>
        )}
        <div style={{ marginTop: "32px", color: "#888", fontSize: "0.98rem", textAlign: "center" }}>
          <div>
            <strong>Store1920</strong> | Dubai, UAE
          </div>
          <div>Email: careers@store1920.ae</div>
        </div>
      </div>
    </div>
  );
};

export default Careers;
