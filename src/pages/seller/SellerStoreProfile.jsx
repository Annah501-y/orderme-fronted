import React, { useEffect, useState } from "react";
import {
    Store,
    Phone,
    MapPin,
    Save,
    Loader,
    CheckCircle,
    Clock,
    XCircle,
} from "lucide-react";

import "../../pages_styles/seller_styles/seller-store-profile.css";
import TanzaniaPhoneInput from "../../components/TanzaniaPhoneInput";
import { getTanzaniaNationalNumber } from "../../utils/tanzaniaPhone";
import PayoutMobileVerification from "../../components/PayoutMobileVerification";

const API_URL = import.meta.env.VITE_API_URL;

function SellerStoreProfile() {
    const [form, setForm] = useState({
        store_name: "",
        store_description: "",
        phone: "",
        address_line: "",
        district: "",
        city: "",
        region: "",
        country: "Tanzania",
    });

    const [status, setStatus] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const token = localStorage.getItem("token");

    /*
    |--------------------------------------------------------------------------
    | Fetch Seller Profile
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(`${API_URL}/seller/profile`, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message || "Failed to load seller profile."
                    );
                }

                const profile = result.data?.seller_profile;
                const address = result.data?.address;

                if (profile) {
                    setForm({
                        store_name: profile.store_name || "",
                        store_description:
                            profile.store_description || "",
                        phone: profile.phone || "",
                        address_line: address?.address_line || "",
                        district: address?.district || "",
                        city: address?.city || "",
                        region: address?.region || "",
                        country: address?.country || "Tanzania",
                    });

                    setStatus(profile.status || "");
                    setRejectionReason(
                        profile.rejection_reason || ""
                    );
                }
            } catch (error) {
                console.error("Seller profile error:", error);

                setError(
                    error.message ||
                    "Unable to load your store profile."
                );
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchProfile();
        } else {
            setError("You are not authenticated.");
            setLoading(false);
        }
    }, [token]);

    /*
    |--------------------------------------------------------------------------
    | Handle Input Changes
    |--------------------------------------------------------------------------
    */

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | Save Profile
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const response = await fetch(`${API_URL}/seller/profile`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...form, phone: getTanzaniaNationalNumber(form.phone) }),
            });

            const result = await response.json();

            if (!response.ok) {
                const validationErrors = result.errors;

                if (validationErrors) {
                    const firstError = Object.values(
                        validationErrors
                    )[0]?.[0];

                    throw new Error(
                        firstError || "Please check your information."
                    );
                }

                throw new Error(
                    result.message || "Failed to update store profile."
                );
            }

            const profile = result.data?.seller_profile;
            const address = result.data?.address;

            if (profile) {
                setStatus(profile.status || "");
                setRejectionReason(
                    profile.rejection_reason || ""
                );
            }

            if (address) {
                setForm((previous) => ({
                    ...previous,
                    address_line: address.address_line || "",
                    district: address.district || "",
                    city: address.city || "",
                    region: address.region || "",
                    country: address.country || "Tanzania",
                }));
            }

            setSuccess(
                result.message ||
                "Store profile updated successfully."
            );
        } catch (error) {
            console.error("Update seller profile error:", error);

            setError(
                error.message ||
                "Unable to update your store profile."
            );
        } finally {
            setSaving(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Status Display
    |--------------------------------------------------------------------------
    */

    const renderStatus = () => {
        if (status === "approved") {
            return (
                <div className="seller-profile-status approved">
                    <CheckCircle size={18} />
                    <div>
                        <strong>Approved</strong>
                        <span>Your store has been approved.</span>
                    </div>
                </div>
            );
        }

        if (status === "rejected") {
            return (
                <div className="seller-profile-status rejected">
                    <XCircle size={18} />
                    <div>
                        <strong>Rejected</strong>
                        <span>
                            {rejectionReason ||
                                "Your store profile was rejected."}
                        </span>
                    </div>
                </div>
            );
        }

        return (
            <div className="seller-profile-status pending">
                <Clock size={18} />
                <div>
                    <strong>Pending Review</strong>
                    <span>
                        Your store is waiting for admin approval.
                    </span>
                </div>
            </div>
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (loading) {
        return (
            <div className="seller-store-profile-page">
                <div className="seller-profile-loading">
                    <Loader className="spinner" size={28} />
                    <p>Loading store profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="seller-store-profile-page">

            {/* Header */}
            <div className="seller-store-profile-header">
                <div>
                    <span className="seller-profile-label">
                        SELLER ACCOUNT
                    </span>

                    <h1>Store Profile</h1>

                    <p>
                        Manage your store information and business
                        location.
                    </p>
                </div>
            </div>

            {/* Alerts */}
            {success && (
                <div className="seller-profile-alert success">
                    <CheckCircle size={18} />
                    {success}
                </div>
            )}

            {error && (
                <div className="seller-profile-alert error">
                    <XCircle size={18} />
                    {error}
                </div>
            )}

            {/* Approval Status */}
            {status && (
                <div className="seller-profile-status-wrapper">
                    {renderStatus()}
                </div>
            )}

            <form onSubmit={handleSubmit}>

                <div className="row g-4">

                    {/* Store Information */}
                    <div className="col-12 col-lg-7">

                        <div className="seller-profile-card">

                            <div className="seller-profile-card-header">
                                <div className="seller-profile-card-icon">
                                    <Store size={20} />
                                </div>

                                <div>
                                    <h2>Store Information</h2>
                                    <p>
                                        Information customers will see
                                        about your store.
                                    </p>
                                </div>
                            </div>

                            <div className="seller-profile-form">

                                <div className="mb-3">
                                    <label htmlFor="store_name">
                                        Store Name
                                    </label>

                                    <input
                                        type="text"
                                        id="store_name"
                                        name="store_name"
                                        className="form-control"
                                        value={form.store_name}
                                        onChange={handleChange}
                                        placeholder="Enter your store name"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="store_description">
                                        Store Description
                                    </label>

                                    <textarea
                                        id="store_description"
                                        name="store_description"
                                        className="form-control"
                                        rows="5"
                                        value={form.store_description}
                                        onChange={handleChange}
                                        placeholder="Describe your store and the products you sell"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="phone">
                                        Store Phone
                                    </label>

                                    <div className="seller-profile-input-icon">
                                        <Phone size={17} />

                                        <TanzaniaPhoneInput
                                            id="phone"
                                            name="phone"
                                            className="form-control"
                                            value={form.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                            </div>

                        </div>

                    </div>

                    {/* Store Address */}
                    <div className="col-12 col-lg-5">

                        <div className="seller-profile-card">

                            <div className="seller-profile-card-header">
                                <div className="seller-profile-card-icon">
                                    <MapPin size={20} />
                                </div>

                                <div>
                                    <h2>Store Location</h2>
                                    <p>
                                        Your store's business address.
                                    </p>
                                </div>
                            </div>

                            <div className="seller-profile-form">

                                <div className="mb-3">
                                    <label htmlFor="address_line">
                                        Address
                                    </label>

                                    <input
                                        type="text"
                                        id="address_line"
                                        name="address_line"
                                        className="form-control"
                                        value={form.address_line}
                                        onChange={handleChange}
                                        placeholder="Street or building name"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="district">
                                        District
                                    </label>

                                    <input
                                        type="text"
                                        id="district"
                                        name="district"
                                        className="form-control"
                                        value={form.district}
                                        onChange={handleChange}
                                        placeholder="e.g. Kinondoni"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="city">
                                        City
                                    </label>

                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        className="form-control"
                                        value={form.city}
                                        onChange={handleChange}
                                        placeholder="e.g. Dar es Salaam"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="region">
                                        Region
                                    </label>

                                    <input
                                        type="text"
                                        id="region"
                                        name="region"
                                        className="form-control"
                                        value={form.region}
                                        onChange={handleChange}
                                        placeholder="e.g. Dar es Salaam"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="country">
                                        Country
                                    </label>

                                    <input
                                        type="text"
                                        id="country"
                                        name="country"
                                        className="form-control"
                                        value={form.country}
                                        onChange={handleChange}
                                    />
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                {/* Save */}
                <div className="seller-profile-save-section">

                    <button
                        type="submit"
                        className="seller-profile-save-button"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <Loader
                                    size={18}
                                    className="spinner"
                                />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Changes
                            </>
                        )}
                    </button>

                </div>

            </form>

            <PayoutMobileVerification />

        </div>
    );
}

export default SellerStoreProfile;
