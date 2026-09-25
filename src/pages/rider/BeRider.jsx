import React, { useState } from "react";
import TanzaniaPhoneInput from "../../components/TanzaniaPhoneInput";
import { getTanzaniaNationalNumber } from "../../utils/tanzaniaPhone";
import "../../pages_styles/rider-styles/be-rider.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function BeRider() {
    const [form, setForm] = useState({ name: "", email: "", phone: "" });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
        setErrors((previous) => ({ ...previous, [name]: undefined }));
        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setErrors({});
        setError("");
        setMessage("");

        try {
            const response = await fetch(`${API_URL}/rider/applications`, {
                method: "POST",
                headers: { Accept: "application/json", "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, phone: getTanzaniaNationalNumber(form.phone) }),
            });
            const result = await response.json().catch(() => ({}));

            if (response.status === 422) {
                setErrors(result.errors || {});
                setError(result.message || "Please check your details and try again.");
                return;
            }
            if (!response.ok) throw new Error(result.message || "Unable to send your rider application.");

            setMessage(result.message || "Your application was sent. Wait for an invitation from OrderMe.");
            setForm({ name: "", email: "", phone: "" });
        } catch (submitError) {
            setError(submitError.message || "Unable to connect to the server. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="be-rider-page">
            <section className="be-rider-card">
                <span className="be-rider-eyebrow">RIDER APPLICATION</span>
                <h1>Become an OrderMe Rider</h1>
                <p className="be-rider-intro">Share your contact details to apply. Our team will review your application and send an invitation if a rider position is available.</p>

                {message && <div className="be-rider-alert success" role="status">{message}</div>}
                {error && <div className="be-rider-alert error" role="alert">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="be-rider-field">
                        <label htmlFor="rider-applicant-name">Full Name</label>
                        <input id="rider-applicant-name" name="name" value={form.name} onChange={handleChange} autoComplete="name" required minLength={2} maxLength={100} disabled={submitting} />
                        {errors.name?.[0] && <small className="be-rider-field-error">{errors.name[0]}</small>}
                    </div>
                    <div className="be-rider-field">
                        <label htmlFor="rider-applicant-email">Email Address</label>
                        <input id="rider-applicant-email" type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" required maxLength={255} disabled={submitting} />
                        {errors.email?.[0] && <small className="be-rider-field-error">{errors.email[0]}</small>}
                    </div>
                    <div className="be-rider-field">
                        <label htmlFor="rider-applicant-phone">Phone Number</label>
                        <TanzaniaPhoneInput id="rider-applicant-phone" name="phone" value={form.phone} onChange={handleChange} required disabled={submitting} />
                        <small className="be-rider-hint">Enter 9 digits starting with 6 or 7.</small>
                        {errors.phone?.[0] && <small className="be-rider-field-error">{errors.phone[0]}</small>}
                    </div>
                    <button className="be-rider-submit" type="submit" disabled={submitting}>
                        {submitting ? "Sending Application…" : "Submit Application"}
                    </button>
                </form>
            </section>
        </main>
    );
}
