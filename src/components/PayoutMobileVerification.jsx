import React, { useState } from "react";
import "../components_styles/payout-mobile-verification.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function PayoutMobileVerification() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const request = async (path, body) => {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`${API_URL}/payout-destination/verification/${path}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Payout verification failed.");
      setMessage(result.message || "Payout number verified.");
      if (path === "verify") setCode("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="payout-verification-panel">
      <div className="payout-verification-content">
        <h3>Mobile Money Payout Verification</h3>
        <p>Request the SMS code sent to your saved payout number, then enter it here.</p>
        {message && <div className="payout-verification-alert success" role="status">{message}</div>}
        {error && <div className="payout-verification-alert error" role="alert">{error}</div>}
        <button type="button" className="payout-verification-send" disabled={busy} onClick={() => request("send")}>{busy ? "Please wait…" : "Send verification code"}</button>
        <div className="payout-verification-code-row">
          <input inputMode="numeric" maxLength={6} placeholder="6-digit code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} aria-label="Payout verification code" />
          <button type="button" className="payout-verification-confirm" disabled={busy || code.length !== 6} onClick={() => request("verify", { code })}>Verify</button>
        </div>
      </div>
    </section>
  );
}
