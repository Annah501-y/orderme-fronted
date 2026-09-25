import React, { useEffect, useState } from "react";
import {
    Camera,
    User,
    Mail,
    Phone,
    MapPin,
    Save,
    Plus,
    Edit3,
    Trash2,
    Check,
    X
} from "lucide-react";

import "../../pages_styles/buyer_styles/buyer-profile.css";
import TanzaniaPhoneInput from "../../components/TanzaniaPhoneInput";
import { getTanzaniaNationalNumber } from "../../utils/tanzaniaPhone";

const API_URL = import.meta.env.VITE_API_URL;

function BuyerProfile() {
    const [user, setUser] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: ""
    });

    const [profileImage, setProfileImage] = useState(null);
    const [profileFile, setProfileFile] = useState(null);

    const [addresses, setAddresses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingAddress, setSavingAddress] = useState(false);

    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);

    const [notification, setNotification] = useState({
        message: "",
        type: ""
    });

    const emptyAddress = {
        address_line: "",
        district: "",
        city: "",
        region: "",
        country: "Tanzania",
        latitude: "",
        longitude: "",
        place_id: "",
        is_default: false
    };

    const [addressForm, setAddressForm] = useState(emptyAddress);

    // =========================
    // TOKEN
    // =========================

    const token = localStorage.getItem("token");

    const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`
    };

    // =========================
    // NOTIFICATION
    // =========================

    const showNotification = (message, type = "success") => {
        setNotification({
            message,
            type
        });

        setTimeout(() => {
            setNotification({
                message: "",
                type: ""
            });
        }, 3000);
    };

    // =========================
    // FETCH PROFILE
    // =========================

    const fetchProfile = async () => {
        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/profile`, {
                method: "GET",
                headers
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Unable to load profile."
                );
            }

            const profileUser = result.data?.user;

            setUser(profileUser);

            setFormData({
                name: profileUser?.name || "",
                email: profileUser?.email || "",
                phone: profileUser?.phone || ""
            });

            setProfileImage(
                result.data?.profile_photo_url || null
            );

            setAddresses(profileUser?.addresses || []);

        } catch (error) {
            console.error("Profile error:", error);

            showNotification(
                error.message || "Unable to load profile.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        fetchProfile();
    }, []);

    // =========================
    // HANDLE PROFILE INPUT
    // =========================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // =========================
    // HANDLE PROFILE IMAGE
    // =========================

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setProfileFile(file);

        const imageUrl = URL.createObjectURL(file);

        setProfileImage(imageUrl);
    };

    // =========================
    // SAVE PROFILE
    // =========================

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSavingProfile(true);

            const data = new FormData();

            data.append("name", formData.name);
            data.append("email", formData.email);
            data.append("phone", getTanzaniaNationalNumber(formData.phone));

            if (profileFile) {
                data.append("profile_photo", profileFile);
            }

            /*
             * Laravel accepts the PUT method through
             * method spoofing when using multipart/form-data.
             */
            data.append("_method", "PUT");

            const response = await fetch(`${API_URL}/profile`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: data
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Unable to update profile."
                );
            }

            const updatedUser = result.data?.user;

            setUser(updatedUser);

            setFormData({
                name: updatedUser?.name || "",
                email: updatedUser?.email || "",
                phone: updatedUser?.phone || ""
            });

            setProfileImage(
                result.data?.profile_photo_url || null
            );

            setProfileFile(null);

            // Keep the navigation account menu in sync with the updated profile.
            localStorage.setItem(
                "user",
                JSON.stringify(updatedUser)
            );

            showNotification(
                result.message || "Profile updated successfully.",
                "success"
            );

        } catch (error) {
            console.error("Update profile error:", error);

            showNotification(
                error.message || "Unable to update profile.",
                "error"
            );
        } finally {
            setSavingProfile(false);
        }
    };

    // =========================
    // ADDRESS INPUT
    // =========================

    const handleAddressChange = (e) => {
        const { name, value, type, checked } = e.target;

        setAddressForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    // =========================
    // OPEN ADD ADDRESS
    // =========================

    const handleAddAddress = () => {
        setEditingAddressId(null);

        setAddressForm({
            ...emptyAddress,
            country: "Tanzania",
            is_default: addresses.length === 0
        });

        setShowAddressForm(true);
    };

    // =========================
    // OPEN EDIT ADDRESS
    // =========================

    const handleEditAddress = (address) => {
        setEditingAddressId(address.id);

        setAddressForm({
            address_line: address.address_line || "",
            district: address.district || "",
            city: address.city || "",
            region: address.region || "",
            country: address.country || "",
            latitude: address.latitude ?? "",
            longitude: address.longitude ?? "",
            place_id: address.place_id || "",
            is_default: Boolean(address.is_default)
        });

        setShowAddressForm(true);
    };

    // =========================
    // CANCEL ADDRESS FORM
    // =========================

    const handleCancelAddress = () => {
        setShowAddressForm(false);
        setEditingAddressId(null);
        setAddressForm(emptyAddress);
    };

    // =========================
    // SAVE ADDRESS
    // =========================

    const handleAddressSubmit = async (e) => {
        e.preventDefault();

        try {
            setSavingAddress(true);

            const payload = {
                address_line: addressForm.address_line,
                district: addressForm.district,
                city: addressForm.city,
                region: addressForm.region,
                country: addressForm.country,
                latitude:
                    addressForm.latitude === ""
                        ? null
                        : Number(addressForm.latitude),
                longitude:
                    addressForm.longitude === ""
                        ? null
                        : Number(addressForm.longitude),
                place_id:
                    addressForm.place_id || null,
                is_default: Boolean(addressForm.is_default)
            };

            const isEditing = editingAddressId !== null;

            const url = isEditing
                ? `${API_URL}/addresses/${editingAddressId}`
                : `${API_URL}/addresses`;

            const response = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: {
                    ...headers,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Unable to save address."
                );
            }

            /*
             * Reload addresses from Laravel so the frontend
             * always reflects the actual database state.
             */
            await fetchProfile();

            handleCancelAddress();

            showNotification(
                result.message ||
                    (isEditing
                        ? "Address updated successfully."
                        : "Address added successfully."),
                "success"
            );

        } catch (error) {
            console.error("Address error:", error);

            showNotification(
                error.message || "Unable to save address.",
                "error"
            );
        } finally {
            setSavingAddress(false);
        }
    };

    // =========================
    // DELETE ADDRESS
    // =========================

    const handleDeleteAddress = async (addressId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this address?"
        );

        if (!confirmed) return;

        try {
            const response = await fetch(
                `${API_URL}/addresses/${addressId}`,
                {
                    method: "DELETE",
                    headers
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Unable to delete address."
                );
            }

            await fetchProfile();

            showNotification(
                result.message || "Address deleted successfully.",
                "success"
            );

        } catch (error) {
            console.error("Delete address error:", error);

            showNotification(
                error.message || "Unable to delete address.",
                "error"
            );
        }
    };

    // =========================
    // SET DEFAULT ADDRESS
    // =========================

    const handleSetDefault = async (addressId) => {
        try {
            const response = await fetch(
                `${API_URL}/addresses/${addressId}/default`,
                {
                    method: "PATCH",
                    headers
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Unable to set default address."
                );
            }

            await fetchProfile();

            showNotification(
                result.message ||
                    "Default address updated successfully.",
                "success"
            );

        } catch (error) {
            console.error("Default address error:", error);

            showNotification(
                error.message ||
                    "Unable to update default address.",
                "error"
            );
        }
    };

    // =========================
    // INITIALS
    // =========================

    const getInitials = (name) => {
        if (!name) return "B";

        return name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };

    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <div className="buyer-profile-page">
                <div className="profile-loading">
                    <div
                        className="spinner-border"
                        role="status"
                    ></div>

                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    // =========================
    // NO USER
    // =========================

    if (!user) {
        return (
            <div className="buyer-profile-page">
                <div className="profile-loading">
                    <p>Unable to load your profile.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="buyer-profile-page">

            {/* =========================
                NOTIFICATION
            ========================= */}

            {notification.message && (
                <div
                    className={`profile-notification ${notification.type}`}
                >
                    <span>{notification.message}</span>

                    <button
                        type="button"
                        onClick={() =>
                            setNotification({
                                message: "",
                                type: ""
                            })
                        }
                        aria-label="Close notification"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* =========================
                HEADER
            ========================= */}

            <div className="profile-header">

                <div>
                    <h1>My Profile</h1>

                    <p>
                        Manage your personal information and
                        delivery addresses
                    </p>
                </div>

            </div>

            {/* =========================
                PROFILE CARD
            ========================= */}

            <div className="profile-card">

                {/* =========================
                    PROFILE IMAGE
                ========================= */}

                <div className="profile-photo-section">

                    <div className="profile-photo-wrapper">

                        {profileImage ? (
                            <img
                                src={profileImage}
                                alt={user.name}
                                className="profile-photo"
                            />
                        ) : (
                            <div className="profile-photo-placeholder">
                                {getInitials(user.name)}
                            </div>
                        )}

                        <label
                            htmlFor="profile-photo"
                            className="profile-camera-button"
                            title="Change profile photo"
                        >
                            <Camera size={17} />

                            <input
                                id="profile-photo"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleImageChange}
                                hidden
                            />
                        </label>

                    </div>

                   

                </div>

                {/* =========================
                    PROFILE FORM
                ========================= */}

                <form
                    className="profile-form"
                    onSubmit={handleSubmit}
                >

                    <div className="form-title">

                        <User size={20} />

                        <h3>
                            Personal Information
                        </h3>

                    </div>

                    {/* NAME */}

                    <div className="form-group">

                        <label>
                            Full Name
                        </label>

                        <div className="input-wrapper">

                            <User size={18} />

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                            />

                        </div>

                    </div>

                    {/* EMAIL */}

                    <div className="form-group">

                        <label>
                            Email Address
                        </label>

                        <div className="input-wrapper">

                            <Mail size={18} />

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email address"
                                required
                            />

                        </div>

                    </div>

                    {/* PHONE */}

                    <div className="form-group">

                        <label>
                            Phone Number
                        </label>

                        <div className="input-wrapper">

                            <Phone size={18} />

                            <TanzaniaPhoneInput name="phone" value={formData.phone} onChange={handleChange} required />

                        </div>

                    </div>

                    {/* SAVE BUTTON */}

                    <button
                        type="submit"
                        className="save-profile-button"
                        disabled={savingProfile}
                    >

                        <Save size={18} />

                        {savingProfile
                            ? "Saving..."
                            : "Save Changes"}

                    </button>

                </form>

            </div>

            {/* =========================
                ADDRESSES SECTION
            ========================= */}

            <div className="addresses-section">

                <div className="addresses-header">

                    <div>
                        <h2>
                            Delivery Addresses
                        </h2>

                        <p>
                            Manage the addresses used for
                            your deliveries.
                        </p>
                    </div>

                    {!showAddressForm && (
                        <button
                            type="button"
                            className="add-address-button"
                            onClick={handleAddAddress}
                        >
                            <Plus size={18} />
                            Add Address
                        </button>
                    )}

                </div>

                {/* =========================
                    ADDRESS FORM
                ========================= */}

                {showAddressForm && (
                    <form
                        className="address-form"
                        onSubmit={handleAddressSubmit}
                    >

                        <div className="form-title">

                            <MapPin size={20} />

                            <h3>
                                {editingAddressId
                                    ? "Edit Address"
                                    : "Add Delivery Address"}
                            </h3>

                        </div>

                        {/* ADDRESS LINE */}

                        <div className="form-group">

                            <label>
                                Address Line
                            </label>

                            <div className="input-wrapper">

                                <MapPin size={18} />

                                <input
                                    type="text"
                                    name="address_line"
                                    value={
                                        addressForm.address_line
                                    }
                                    onChange={
                                        handleAddressChange
                                    }
                                    placeholder="Enter your address"
                                    required
                                />

                            </div>

                        </div>

                        <div className="address-form-grid">

                            {/* DISTRICT */}

                            <div className="form-group">

                                <label>
                                    District
                                </label>

                                <input
                                    type="text"
                                    name="district"
                                    value={
                                        addressForm.district
                                    }
                                    onChange={
                                        handleAddressChange
                                    }
                                    placeholder="District"
                                    required
                                />

                            </div>

                            {/* CITY */}

                            <div className="form-group">

                                <label>
                                    City
                                </label>

                                <input
                                    type="text"
                                    name="city"
                                    value={addressForm.city}
                                    onChange={
                                        handleAddressChange
                                    }
                                    placeholder="City"
                                    required
                                />

                            </div>

                            {/* REGION */}

                            <div className="form-group">

                                <label>
                                    Region
                                </label>

                                <input
                                    type="text"
                                    name="region"
                                    value={addressForm.region}
                                    onChange={
                                        handleAddressChange
                                    }
                                    placeholder="Region"
                                    required
                                />

                            </div>

                            {/* COUNTRY */}

                            <div className="form-group">

                                <label>
                                    Country
                                </label>

                                <input
                                    type="text"
                                    name="country"
                                    value={
                                        addressForm.country
                                    }
                                    onChange={
                                        handleAddressChange
                                    }
                                    placeholder="Country"
                                    required
                                />

                            </div>

                        </div>

                        {/* GOOGLE MAP DATA
                            These remain hidden for now.
                            They can be populated once Google Maps
                            integration is added.
                        */}

                        <input
                            type="hidden"
                            name="latitude"
                            value={addressForm.latitude}
                            readOnly
                        />

                        <input
                            type="hidden"
                            name="longitude"
                            value={addressForm.longitude}
                            readOnly
                        />

                        <input
                            type="hidden"
                            name="place_id"
                            value={addressForm.place_id}
                            readOnly
                        />

                        {/* DEFAULT */}

                        <label className="default-address-option">

                            <input
                                type="checkbox"
                                name="is_default"
                                checked={
                                    addressForm.is_default
                                }
                                onChange={
                                    handleAddressChange
                                }
                            />

                            <span>
                                Set as default delivery
                                address
                            </span>

                        </label>

                        {/* ACTIONS */}

                        <div className="address-form-actions">

                            <button
                                type="button"
                                className="cancel-address-button"
                                onClick={handleCancelAddress}
                                disabled={savingAddress}
                            >
                                <X size={17} />
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-address-button"
                                disabled={savingAddress}
                            >
                                <Save size={17} />

                                {savingAddress
                                    ? "Saving..."
                                    : editingAddressId
                                    ? "Update Address"
                                    : "Save Address"}
                            </button>

                        </div>

                    </form>
                )}

                {/* =========================
                    ADDRESS LIST
                ========================= */}

                {!showAddressForm &&
                    addresses.length === 0 && (
                        <div className="empty-addresses">

                            <MapPin size={30} />

                            <h3>
                                No delivery addresses
                            </h3>

                            <p>
                                Add an address so your orders
                                can be delivered to you.
                            </p>

                            <button
                                type="button"
                                onClick={handleAddAddress}
                            >
                                <Plus size={17} />
                                Add Address
                            </button>

                        </div>
                    )}

                {!showAddressForm &&
                    addresses.length > 0 && (
                        <div className="address-list">

                            {addresses.map((address) => (
                                <div
                                    className="address-card"
                                    key={address.id}
                                >

                                    <div className="address-card-header">

                                        <div className="address-title">

                                            <MapPin size={19} />

                                            <strong>
                                                Delivery Address
                                            </strong>

                                        </div>

                                        {address.is_default && (
                                            <span className="default-badge">
                                                <Check size={14} />
                                                Default
                                            </span>
                                        )}

                                    </div>

                                    <div className="address-details">

                                        <strong>
                                            {address.address_line}
                                        </strong>

                                        <p>
                                            {address.district},{" "}
                                            {address.city}
                                        </p>

                                        <p>
                                            {address.region},{" "}
                                            {address.country}
                                        </p>

                                    </div>

                                    <div className="address-actions">

                                        {!address.is_default && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleSetDefault(
                                                        address.id
                                                    )
                                                }
                                            >
                                                <Check size={16} />
                                                Set Default
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleEditAddress(
                                                    address
                                                )
                                            }
                                        >
                                            <Edit3 size={16} />
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            className="delete-address-button"
                                            onClick={() =>
                                                handleDeleteAddress(
                                                    address.id
                                                )
                                            }
                                        >
                                            <Trash2 size={16} />
                                            Delete
                                        </button>

                                    </div>

                                </div>
                            ))}

                        </div>
                    )}

            </div>

        </div>
    );
}

export default BuyerProfile;
