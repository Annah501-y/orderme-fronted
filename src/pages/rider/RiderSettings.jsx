import React, { useEffect, useState } from "react";
import { Banknote, ShieldCheck } from "lucide-react";
import { toTanzaniaPhoneNumber } from "../../utils/tanzaniaPhone";
import "../../pages_styles/rider-styles/rider-settings.css";

const API_URL = import.meta.env.VITE_API_URL;
const emptyPayout = {
    payout_method: "mobile_money",
    mobile_phone: "",
    bank_bic: "",
    bank_account_number: "",
    bank_account_name: "",
};

function RiderSettings() {
    const [payout, setPayout] = useState(emptyPayout);
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

        // Load only this rider's saved payout destination from the protected settings endpoint.
        async function loadPayoutSettings() {
            try {
                const response = await fetch(`${API_URL}/payout-destination`, { headers: authHeaders() });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || "Unable to load payout settings.");
                if (active && result.data) {
                    setPayout({ ...emptyPayout, ...result.data });
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
            setMessage(result.message || "Payout settings saved. Complete verification to activate them.");
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

    if (loading) return <main className="rider-settings-page"><p className="rider-settings-loading">Loading settings...</p></main>;

    return (
        <main className="rider-settings-page">
            <header className="rider-settings-header">
                <div className="rider-settings-header-icon"><Banknote size={24} /></div>
                <div><h1>Rider Settings</h1><p>Manage where your rider earnings are paid.</p></div>
            </header>

            {error && <div className="rider-settings-alert error" role="alert">{error}</div>}
            {message && <div className="rider-settings-alert success" role="status">{message}</div>}

            <section className="rider-settings-card">
                <div className="rider-settings-card-title"><Banknote size={19} /><div><h2>Payout destination</h2><p>Use a mobile money wallet or a bank account in your name.</p></div></div>

                <form onSubmit={savePayout}>
                    <label className="rider-settings-field">Payout method
                        <select name="payout_method" value={payout.payout_method} onChange={updateField} required>
                            <option value="mobile_money">Mobile money</option>
                            <option value="bank">Bank transfer</option>
                        </select>
                    </label>

                    {payout.payout_method === "mobile_money" ? (
                        <label className="rider-settings-field">Mobile money number
                            <input type="tel" name="mobile_phone" value={payout.mobile_phone} onChange={updateField} placeholder="+255 7XX XXX XXX" required />
                        </label>
                    ) : (
                        <div className="rider-settings-fields">
                            <label className="rider-settings-field">Bank BIC<input name="bank_bic" value={payout.bank_bic} onChange={updateField} maxLength={20} required /></label>
                            <label className="rider-settings-field">Account number<input name="bank_account_number" value={payout.bank_account_number} onChange={updateField} maxLength={50} required /></label>
                            <label className="rider-settings-field">Account holder name<input name="bank_account_name" value={payout.bank_account_name} onChange={updateField} maxLength={255} required /></label>
                        </div>
                    )}

                    <button className="rider-settings-primary" type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save payout destination"}
                    </button>
                </form>

                {payout.payout_method === "mobile_money" && (
                    <div className="rider-settings-verification">
                        <div className={`rider-settings-verification-status ${verifiedAt ? "verified" : "pending"}`}>
                            <ShieldCheck size={18} />
                            {verifiedAt ? "Payout number verified" : "Verification required"}
                        </div>
                        {!verifiedAt && (
                            <>
                                <button className="rider-settings-secondary" type="button" onClick={sendVerificationCode} disabled={sendingCode || saving}>
                                    {sendingCode ? "Sending code..." : "Send verification code"}
                                </button>
                                <form className="rider-settings-code-form" onSubmit={verifyPayout}>
                                    <label className="rider-settings-field">6-digit verification code
                                        <input inputMode="numeric" autoComplete="one-time-code" value={verificationCode} onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))} minLength={6} maxLength={6} required />
                                    </label>
                                    <button className="rider-settings-primary" type="submit" disabled={verifying || verificationCode.length !== 6}>
                                        {verifying ? "Verifying..." : "Verify payout number"}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}

export default RiderSettings;
