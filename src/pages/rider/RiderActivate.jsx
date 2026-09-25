import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import TanzaniaPhoneInput from "../../components/TanzaniaPhoneInput";
import { toTanzaniaPhoneNumber } from "../../utils/tanzaniaPhone";

const API_URL = import.meta.env.VITE_API_URL;

const RiderActivate = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [payout, setPayout] = useState({ payout_method: "mobile_money", mobile_phone: "", bank_bic: "", bank_account_number: "", bank_account_name: "" });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!token) {
            setError("Invalid or missing invitation token.");
            return;
        }

        if (password !== passwordConfirmation) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/rider/activate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    token,
                    password,
                    password_confirmation: passwordConfirmation,
                    ...payout,
                    ...(payout.payout_method === "mobile_money" ? { mobile_phone: toTanzaniaPhoneNumber(payout.mobile_phone) } : {}),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                const validationMessage = Object.values(data.errors || {}).flat().join(" ");
                throw new Error(
                    validationMessage || data.message || "Unable to activate your rider account."
                );
            }

            setMessage(
                data.message ||
                    "Your rider account has been activated successfully."
            );

            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4">
                            <h2 className="text-center mb-2">
                                Activate Rider Account
                            </h2>

                            <p className="text-muted text-center mb-4">
                                Create a password to activate your OrderMe
                                rider account.
                            </p>

                            {message && (
                                <div className="alert alert-success">
                                    {message}
                                </div>
                            )}

                            {error && (
                                <div className="alert alert-danger">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label" htmlFor="payout_method">Payout Method</label>
                                    <select id="payout_method" className="form-select" value={payout.payout_method} onChange={(e) => setPayout({ ...payout, payout_method: e.target.value })} required>
                                        <option value="mobile_money">Mobile Money</option>
                                        <option value="bank">Bank Transfer</option>
                                    </select>
                                </div>
                                {payout.payout_method === "mobile_money" ? (
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="mobile_phone">Mobile Money Number</label>
                                        <TanzaniaPhoneInput id="mobile_phone" name="mobile_phone" value={payout.mobile_phone} onChange={(e) => setPayout({ ...payout, mobile_phone: e.target.value })} required />
                                    </div>
                                ) : [ ["bank_bic", "Bank BIC"], ["bank_account_number", "Account Number"], ["bank_account_name", "Account Holder Name"] ].map(([field, label]) => (
                                    <div className="mb-3" key={field}>
                                        <label className="form-label" htmlFor={field}>{label}</label>
                                        <input id={field} className="form-control" value={payout[field]} onChange={(e) => setPayout({ ...payout, [field]: e.target.value })} required />
                                    </div>
                                ))}
                                <div className="mb-3">
                                    <label className="form-label">
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        className="form-control"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">
                                        Confirm Password
                                    </label>

                                    <input
                                        type="password"
                                        className="form-control"
                                        value={passwordConfirmation}
                                        onChange={(e) =>
                                            setPasswordConfirmation(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Confirm your password"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn w-100"
                                    disabled={loading}
                                    style={{
                                        backgroundColor: "#d4a017",
                                        color: "#fff",
                                    }}
                                >
                                    {loading
                                        ? "Activating..."
                                        : "Activate Account"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiderActivate;
