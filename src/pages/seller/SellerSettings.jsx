import React, { useEffect, useState } from "react";
import { Banknote, ShieldCheck, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { toTanzaniaPhoneNumber } from "../../utils/tanzaniaPhone";
import "../../pages_styles/seller_styles/seller-settings.css";

const API_URL = import.meta.env.VITE_API_URL;
const EMPTY_PAYOUT = {
    payout_method: "mobile_money",
    mobile_phone: "",
    bank_bic: "",
    bank_account_number: "",
    bank_account_name: "",
};

function SellerSettings() {
    const [payout, setPayout] = useState(EMPTY_PAYOUT);
    const [verifiedAt, setVerifiedAt] = useState(null);
    const [verificationCode, setVerificationCode] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const authHeaders = () => ({
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    });

    useEffect(() => {
        let active = true;

        // Load this seller's payout destination from the authenticated settings API.
        async function loadPayoutSettings() {
            try {
                const response = await fetch(`${API_URL}/payout-destination`, { headers: authHeaders() });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || "Unable to load payout settings.");
                if (active && result.data) {
                    setPayout({ ...EMPTY_PAYOUT, ...result.data });
                    setVerifiedAt(result.data.verified_at || null);
                }
            } catch (loadError) {
                if (active) setError(loadError.message || "Unable to load payout settings.");
            } finally {
                if (active) setLoading(false);
            }
        }

        loadPayoutSettings();
        return () => { active = false; };
    }, []);

    const updateField = (event) => {
        const { name, value } = event.target;
        setPayout((current) => ({ ...current, [name]: value }));
        setVerifiedAt(null);
        setError("");
        setMessage("");
    };

    const savePayout = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");

        const payload = {
            ...payout,
            ...(payout.payout_method === "mobile_money"
                ? { mobile_phone: toTanzaniaPhoneNumber(payout.mobile_phone) }
                : {}),
        };

        try {
            const response = await fetch(`${API_URL}/payout-destination`, {
                method: "PUT",
                headers: { ...authHeaders(), "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (!response.ok) {
                const validationMessage = Object.values(result.errors || {}).flat().join(" ");
                throw new Error(validationMessage || result.message || "Unable to save payout settings.");
            }
            setPayout((current) => ({ ...current, ...payload }));
            setVerifiedAt(null);
            setMessage(payout.payout_method === "mobile_money"
                ? result.message || "Payout details saved. Verify your mobile money number to activate it."
                : "Bank payout destination saved.");
        } catch (saveError) {
            setError(saveError.message || "Unable to save payout settings.");
        } finally {
            setSaving(false);
        }
    };

    const sendVerificationCode = async () => {
        setSendingCode(true);
        setError("");
        setMessage("");
        try {
            const response = await fetch(`${API_URL}/payout-destination/verification/send`, {
                method: "POST",
                headers: authHeaders(),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Unable to send a verification code.");
            setMessage(result.message || "Verification code sent to your mobile money number.");
        } catch (sendError) {
            setError(sendError.message || "Unable to send a verification code.");
        } finally {
            setSendingCode(false);
        }
    };

    const verifyPayout = async (event) => {
        event.preventDefault();
        setVerifying(true);
        setError("");
        setMessage("");
        try {
            const response = await fetch(`${API_URL}/payout-destination/verification/verify`, {
                method: "POST",
                headers: { ...authHeaders(), "Content-Type": "application/json" },
                body: JSON.stringify({ code: verificationCode }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Unable to verify payout settings.");
            setVerifiedAt(new Date().toISOString());
            setVerificationCode("");
            setMessage(result.message || "Payout destination verified.");
        } catch (verifyError) {
            setError(verifyError.message || "Unable to verify payout settings.");
        } finally {
            setVerifying(false);
        }
    };

    if (loading) {
        return <main className="seller-settings-page"><p className="seller-settings-loading">Loading settings...</p></main>;
    }

    return (
        <main className="seller-settings-page">
            <header className="seller-settings-header">
                <div className="seller-settings-header-icon"><Store size={23} /></div>
                <div>
                    <p className="seller-settings-eyebrow">Store account</p>
                    <h1>Seller Settings</h1>
                    <p>Manage your payout destination and store information.</p>
                </div>
            </header>

            {error && <div className="seller-settings-alert error" role="alert">{error}</div>}
            {message && <div className="seller-settings-alert success" role="status">{message}</div>}

            <section className="seller-settings-card">
                <div className="seller-settings-card-title">
                    <Banknote size={20} />
                    <div><h2>Payout destination</h2><p>Choose where your completed order earnings should be paid.</p></div>
                </div>

                <form className="seller-settings-form" onSubmit={savePayout}>
                    <label className="seller-settings-field">Payout method
                        <select name="payout_method" value={payout.payout_method} onChange={updateField} required>
                            <option value="mobile_money">Mobile money</option>
                            <option value="bank">Bank transfer</option>
                        </select>
                    </label>

                    {payout.payout_method === "mobile_money" ? (
                        <label className="seller-settings-field">Mobile money number
                            <input type="tel" name="mobile_phone" autoComplete="tel" value={payout.mobile_phone} onChange={updateField} placeholder="+255 7XX XXX XXX" required />
                        </label>
                    ) : (
                        <div className="seller-settings-fields">
                            <label className="seller-settings-field">Bank BIC<input name="bank_bic" value={payout.bank_bic} onChange={updateField} maxLength={20} required /></label>
                            <label className="seller-settings-field">Account number<input name="bank_account_number" value={payout.bank_account_number} onChange={updateField} maxLength={50} required /></label>
                            <label className="seller-settings-field">Account holder name<input name="bank_account_name" value={payout.bank_account_name} onChange={updateField} maxLength={255} required /></label>
                        </div>
                    )}

                    <button className="seller-settings-primary" type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save payout destination"}
                    </button>
                </form>

                {payout.payout_method === "mobile_money" && (
                    <div className="seller-settings-verification">
                        <div className={`seller-settings-verification-status ${verifiedAt ? "verified" : "pending"}`}>
                            <ShieldCheck size={18} />
                            {verifiedAt ? "Payout number verified" : "Verification required"}
                        </div>
                        {!verifiedAt && (
                            <>
                                <button className="seller-settings-secondary" type="button" onClick={sendVerificationCode} disabled={sendingCode || saving}>
                                    {sendingCode ? "Sending code..." : "Send verification code"}
                                </button>
                                <form className="seller-settings-code-form" onSubmit={verifyPayout}>
                                    <label className="seller-settings-field">6-digit verification code
                                        <input inputMode="numeric" autoComplete="one-time-code" value={verificationCode} onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))} minLength={6} maxLength={6} required />
                                    </label>
                                    <button className="seller-settings-primary" type="submit" disabled={verifying || verificationCode.length !== 6}>
                                        {verifying ? "Verifying..." : "Verify payout number"}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                )}
            </section>

            <section className="seller-settings-profile-link">
                <div><h2>Store profile</h2><p>Update your shop name, contact details, business address, and location.</p></div>
                <Link to="/seller/store-profile">Manage store profile</Link>
            </section>
        </main>
    );
}

export default SellerSettings;
