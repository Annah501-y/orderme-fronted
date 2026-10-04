import React, { useEffect, useState } from "react";
import { BadgeCheck, Bike, FileText, UserRound } from "lucide-react";
import { getTanzaniaNationalNumber } from "../../utils/tanzaniaPhone";
import "../../pages_styles/rider-styles/rider-profile.css";

const API_URL = import.meta.env.VITE_API_URL;

const emptyProfile = {
    name: "",
    email: "",
    phone: "",
    vehicle_type: "",
    license_number: "",
    license_status: "not_submitted",
    license_review_note: "",
    has_license_document: false,
};

function RiderProfile() {
    const [profile, setProfile] = useState(emptyProfile);
    const [licenseDocument, setLicenseDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        let active = true;

        async function loadProfile() {
            try {
                const response = await fetch(`${API_URL}/rider/profile`, {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || "Unable to load your rider profile.");

                if (active) {
                    setProfile({
                        ...emptyProfile,
                        ...result.data?.rider,
                        name: result.data?.user?.name || "",
                        email: result.data?.user?.email || "",
                        phone: result.data?.user?.phone || "",
                    });
                }
            } catch (loadError) {
                if (active) setError(loadError.message || "Unable to load your rider profile.");
            } finally {
                if (active) setLoading(false);
            }
        }

        loadProfile();
        return () => { active = false; };
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setProfile((current) => ({ ...current, [name]: value }));
        setError("");
        setMessage("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");

        const phone = getTanzaniaNationalNumber(profile.phone);
        if (phone.length !== 9) {
            setError("Enter a valid Tanzania phone number with 9 digits.");
            setSaving(false);
            return;
        }

        const payload = new FormData();
        payload.append("name", profile.name.trim());
        payload.append("email", profile.email.trim());
        payload.append("phone", phone);
        payload.append("vehicle_type", profile.vehicle_type);
        payload.append("license_number", profile.license_number.trim());
        if (licenseDocument) payload.append("license_document", licenseDocument);
        payload.append("_method", "PUT");

        try {
            const response = await fetch(`${API_URL}/rider/profile`, {
                // Method spoofing lets PHP reliably parse a multipart document upload.
                method: "POST",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: payload,
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                const validationMessage = Object.values(result.errors || {}).flat().join(" ");
                throw new Error(validationMessage || result.message || "Unable to submit your rider profile.");
            }

            setProfile((current) => ({
                ...current,
                phone,
                license_status: result.data?.license_status || "pending",
                has_license_document: current.has_license_document || Boolean(licenseDocument),
                license_review_note: "",
            }));
            setLicenseDocument(null);
            setMessage(result.message || "Profile submitted for licence review.");
        } catch (submitError) {
            setError(submitError.message || "Unable to submit your rider profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <main className="rider-profile-page"><p className="rider-profile-loading">Loading rider profile...</p></main>;

    return (
        <main className="rider-profile-page">
            <header className="rider-profile-header">
                <div className="rider-profile-header-icon"><UserRound size={24} /></div>
                <div>
                    <h1>Rider Profile</h1>
                    <p>Complete your contact and vehicle details before starting deliveries.</p>
                </div>
            </header>

            {error && <div className="rider-profile-alert error" role="alert">{error}</div>}
            {message && <div className="rider-profile-alert success" role="status">{message}</div>}

            <form className="rider-profile-card" onSubmit={handleSubmit}>
                <section className="rider-profile-section">
                    <div className="rider-profile-section-title">
                        <UserRound size={19} />
                        <div><h2>Contact details</h2><p>Keep your account and dispatch contact information current.</p></div>
                    </div>
                    <div className="rider-profile-fields">
                        <label>Full name<input name="name" value={profile.name} onChange={handleChange} autoComplete="name" required minLength={2} maxLength={100} /></label>
                        <label>Email address<input name="email" type="email" value={profile.email} onChange={handleChange} autoComplete="email" required maxLength={255} /></label>
                        <label>Phone number<input name="phone" type="tel" value={profile.phone} onChange={handleChange} autoComplete="tel" required placeholder="+255 7XX XXX XXX" /></label>
                    </div>
                </section>

                <section className="rider-profile-section">
                    <div className="rider-profile-section-title">
                        <Bike size={19} />
                        <div><h2>Vehicle and licence</h2><p>Upload a readable licence image or PDF. An administrator must approve it before you can start a delivery.</p></div>
                    </div>
                    <div className="rider-profile-fields">
                        <label>Vehicle type
                            <select name="vehicle_type" value={profile.vehicle_type} onChange={handleChange} required>
                                <option value="">Select your delivery vehicle</option>
                                <option value="bodaboda">Bodaboda</option>
                                <option value="bajaji">Bajaji</option>
                            </select>
                        </label>
                        <label>Plate number<input name="license_number" value={profile.license_number} onChange={handleChange} required maxLength={64} /></label>
                        <label className="rider-profile-file-field">Licence document
                            <span className="rider-profile-file-control"><FileText size={18} /><input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(event) => setLicenseDocument(event.target.files?.[0] || null)} required={!profile.has_license_document} /></span>
                            <small>{licenseDocument?.name || (profile.has_license_document ? "A document is already on file. Choose a new file only if you need to replace it." : "PDF, JPG, or PNG; maximum 10 MB.")}</small>
                        </label>
                    </div>
                    <div className={`rider-license-status ${profile.license_status}`}>
                        <BadgeCheck size={18} />
                        <span>Licence review: <strong>{profile.license_status.replaceAll("_", " ")}</strong></span>
                    </div>
                    {profile.license_review_note && <p className="rider-license-review-note">Admin note: {profile.license_review_note}</p>}
                </section>

                <footer className="rider-profile-actions">
                    <button type="submit" disabled={saving}>
                        {saving ? "Submitting profile..." : "Save and submit for review"}
                    </button>
                </footer>
            </form>
        </main>
    );
}

export default RiderProfile;
