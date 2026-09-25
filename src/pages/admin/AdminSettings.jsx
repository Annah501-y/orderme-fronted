import React, { useEffect, useRef, useState } from "react";

import {
    User,
    Mail,
    Phone,
    Camera,
    Lock,
    Eye,
    EyeOff,
    Save,
    Upload,
    LogOut,
    ShieldCheck,
    Loader2,
} from "lucide-react";

import "../../pages_styles/admin-styles/admin-settings.css";
import TanzaniaPhoneInput from "../../components/TanzaniaPhoneInput";
import { getTanzaniaNationalNumber } from "../../utils/tanzaniaPhone";

const API_URL = import.meta.env.VITE_API_URL;

const AdminSettings = () => {
    const token = localStorage.getItem("token");

    const fileInputRef = useRef(null);

    // ========================================
    // ADMIN PROFILE
    // ========================================

    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        profile_photo: null,
    });

    const [loadingProfile, setLoadingProfile] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);

    // ========================================
    // PROFILE PHOTO
    // ========================================

    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [previewPhoto, setPreviewPhoto] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    // ========================================
    // PASSWORD
    // ========================================

    const [passwordData, setPasswordData] = useState({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const [showCurrentPassword, setShowCurrentPassword] =
        useState(false);

    const [showNewPassword, setShowNewPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [changingPassword, setChangingPassword] =
        useState(false);

    // ========================================
    // LOGOUT ALL
    // ========================================

    const [loggingOutAll, setLoggingOutAll] = useState(false);

    // ========================================
    // MESSAGES
    // ========================================

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // ========================================
    // FETCH ADMIN SETTINGS
    // ========================================

    const fetchSettings = async () => {
        try {
            setLoadingProfile(true);
            setErrorMessage("");

            const response = await fetch(
                `${API_URL}/admin/settings`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Failed to load admin settings."
                );
            }

            setProfile({
                name: result.data.name || "",
                email: result.data.email || "",
                phone: result.data.phone || "",
                profile_photo:
                    result.data.profile_photo || null,
            });
        } catch (error) {
            console.error(
                "Failed to load admin settings:",
                error
            );

            setErrorMessage(
                error.message ||
                    "Failed to load admin settings."
            );
        } finally {
            setLoadingProfile(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    // ========================================
    // PROFILE INPUT
    // ========================================

    const handleProfileChange = (event) => {
        const { name, value } = event.target;

        setProfile((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // ========================================
    // UPDATE PROFILE
    // ========================================

    const handleProfileSubmit = async (event) => {
        event.preventDefault();

        try {
            setSavingProfile(true);
            setSuccessMessage("");
            setErrorMessage("");

            const response = await fetch(
                `${API_URL}/admin/settings/profile`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: profile.name,
                        email: profile.email,
                        phone: getTanzaniaNationalNumber(profile.phone),
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Failed to update profile."
                );
            }

            setProfile((previous) => ({
                ...previous,
                ...result.data,
            }));

            // Keep localStorage user information
            // synchronized with the updated admin profile.
            const storedUser =
                localStorage.getItem("user");

            if (storedUser) {
                try {
                    const user = JSON.parse(storedUser);

                    const updatedUser = {
                        ...user,
                        name: result.data.name,
                        email: result.data.email,
                        phone: result.data.phone,
                    };

                    localStorage.setItem(
                        "user",
                        JSON.stringify(updatedUser)
                    );
                } catch (error) {
                    console.error(
                        "Failed to update stored user:",
                        error
                    );
                }
            }

            setSuccessMessage(
                "Profile information updated successfully."
            );
        } catch (error) {
            console.error(
                "Failed to update profile:",
                error
            );

            setErrorMessage(
                error.message ||
                    "Failed to update profile."
            );
        } finally {
            setSavingProfile(false);
        }
    };

    // ========================================
    // SELECT PROFILE PHOTO
    // ========================================

    const handlePhotoSelect = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setSelectedPhoto(file);

        const previewUrl = URL.createObjectURL(file);

        setPreviewPhoto(previewUrl);

        setSuccessMessage("");
        setErrorMessage("");
    };

    // ========================================
    // UPLOAD PROFILE PHOTO
    // ========================================

    const handlePhotoUpload = async () => {
        if (!selectedPhoto) {
            setErrorMessage(
                "Please choose a profile picture first."
            );

            return;
        }

        try {
            setUploadingPhoto(true);
            setSuccessMessage("");
            setErrorMessage("");

            const formData = new FormData();

            formData.append(
                "profile_photo",
                selectedPhoto
            );

            const response = await fetch(
                `${API_URL}/admin/settings/profile-photo`,
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Failed to update profile picture."
                );
            }

            const newPhoto =
                result.data.profile_photo;

            setProfile((previous) => ({
                ...previous,
                profile_photo: newPhoto,
            }));

            setSelectedPhoto(null);

            if (previewPhoto) {
                URL.revokeObjectURL(previewPhoto);
            }

            setPreviewPhoto(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            setSuccessMessage(
                "Profile picture updated successfully."
            );
        } catch (error) {
            console.error(
                "Failed to upload profile photo:",
                error
            );

            setErrorMessage(
                error.message ||
                    "Failed to update profile picture."
            );
        } finally {
            setUploadingPhoto(false);
        }
    };

    // ========================================
    // CANCEL PHOTO SELECTION
    // ========================================

    const handleCancelPhoto = () => {
        setSelectedPhoto(null);

        if (previewPhoto) {
            URL.revokeObjectURL(previewPhoto);
        }

        setPreviewPhoto(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // ========================================
    // PASSWORD INPUT
    // ========================================

    const handlePasswordChange = (event) => {
        const { name, value } = event.target;

        setPasswordData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // ========================================
    // CHANGE PASSWORD
    // ========================================

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();

        if (
            passwordData.password !==
            passwordData.password_confirmation
        ) {
            setErrorMessage(
                "New password and confirmation password do not match."
            );

            return;
        }

        try {
            setChangingPassword(true);
            setSuccessMessage("");
            setErrorMessage("");

            const response = await fetch(
                `${API_URL}/admin/settings/password`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(passwordData),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Failed to change password."
                );
            }

            setPasswordData({
                current_password: "",
                password: "",
                password_confirmation: "",
            });

            setSuccessMessage(
                "Password changed successfully."
            );
        } catch (error) {
            console.error(
                "Failed to change password:",
                error
            );

            setErrorMessage(
                error.message ||
                    "Failed to change password."
            );
        } finally {
            setChangingPassword(false);
        }
    };

    // ========================================
    // LOGOUT ALL DEVICES
    // ========================================

    const handleLogoutAll = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to log out from all devices?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setLoggingOutAll(true);
            setSuccessMessage("");
            setErrorMessage("");

            const response = await fetch(
                `${API_URL}/admin/settings/logout-all`,
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Failed to log out from all devices."
                );
            }

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href = "/login";
        } catch (error) {
            console.error(
                "Failed to logout all devices:",
                error
            );

            setErrorMessage(
                error.message ||
                    "Failed to log out from all devices."
            );
        } finally {
            setLoggingOutAll(false);
        }
    };

    // ========================================
    // CLEANUP PREVIEW URL
    // ========================================

    useEffect(() => {
        return () => {
            if (previewPhoto) {
                URL.revokeObjectURL(previewPhoto);
            }
        };
    }, [previewPhoto]);

    // ========================================
    // PROFILE IMAGE
    // ========================================

    const displayedProfilePhoto =
        previewPhoto || profile.profile_photo;

    // ========================================
    // LOADING
    // ========================================

    if (loadingProfile) {
        return (
            <div className="admin-settings-loading">
                <Loader2
                    size={30}
                    className="admin-settings-spinner"
                />

                <p>Loading admin settings...</p>
            </div>
        );
    }

    // ========================================
    // UI
    // ========================================

    return (
        <div className="admin-settings">
            {/* ========================================
                HEADER
            ======================================== */}

            <div className="admin-settings-header">
                <div>
                    <h1>Admin Settings</h1>

                    <p>
                        Manage your administrator account,
                        security, and profile information.
                    </p>
                </div>

                <div className="admin-settings-header-icon">
                    <ShieldCheck size={28} />
                </div>
            </div>

            {/* ========================================
                MESSAGES
            ======================================== */}

            {successMessage && (
                <div className="admin-settings-success">
                    {successMessage}
                </div>
            )}

            {errorMessage && (
                <div className="admin-settings-error">
                    {errorMessage}
                </div>
            )}

            {/* ========================================
                PROFILE SECTION
            ======================================== */}

            <section className="admin-settings-card">
                <div className="admin-settings-card-header">
                    <div>
                        <h2>Profile Information</h2>

                        <p>
                            Update your administrator
                            account information.
                        </p>
                    </div>

                    <User size={22} />
                </div>

                <div className="admin-settings-profile-layout">
                    {/* PROFILE PHOTO */}

                    <div className="admin-settings-photo-section">
                        <div className="admin-settings-photo">
                            {displayedProfilePhoto ? (
                                <img
                                    src={
                                        displayedProfilePhoto
                                    }
                                    alt={
                                        profile.name ||
                                        "Admin profile"
                                    }
                                />
                            ) : (
                                <User size={55} />
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp"
                            onChange={handlePhotoSelect}
                            hidden
                        />

                        <button
                            type="button"
                            className="admin-settings-photo-btn"
                            onClick={() =>
                                fileInputRef.current?.click()
                            }
                            disabled={uploadingPhoto}
                        >
                            <Camera size={17} />
                            Choose Photo
                        </button>

                        {selectedPhoto && (
                            <div className="admin-settings-photo-actions">
                                <span>
                                    {selectedPhoto.name}
                                </span>

                                <button
                                    type="button"
                                    onClick={
                                        handlePhotoUpload
                                    }
                                    disabled={
                                        uploadingPhoto
                                    }
                                >
                                    {uploadingPhoto ? (
                                        <>
                                            <Loader2
                                                size={16}
                                                className="admin-settings-spinner"
                                            />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload
                                                size={16}
                                            />
                                            Upload
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        handleCancelPhoto
                                    }
                                    disabled={
                                        uploadingPhoto
                                    }
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                        <small>
                            JPG, JPEG, PNG or WEBP. Maximum
                            size: 5MB.
                        </small>
                    </div>

                    {/* PROFILE FORM */}

                    <form
                        className="admin-settings-form"
                        onSubmit={
                            handleProfileSubmit
                        }
                    >
                        <div className="admin-settings-form-grid">
                            <div className="admin-form-group">
                                <label htmlFor="name">
                                    Full Name
                                </label>

                                <div className="admin-input-wrapper">
                                    <User size={18} />

                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={
                                            profile.name
                                        }
                                        onChange={
                                            handleProfileChange
                                        }
                                        placeholder="Enter your name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="email">
                                    Email Address
                                </label>

                                <div className="admin-input-wrapper">
                                    <Mail size={18} />

                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={
                                            profile.email
                                        }
                                        onChange={
                                            handleProfileChange
                                        }
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="phone">
                                    Phone Number
                                </label>

                                <div className="admin-input-wrapper">
                                    <Phone size={18} />

                                    <TanzaniaPhoneInput
                                        id="phone"
                                        name="phone"
                                        value={
                                            profile.phone
                                        }
                                        onChange={
                                            handleProfileChange
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="admin-settings-form-actions">
                            <button
                                type="submit"
                                className="admin-settings-save-btn"
                                disabled={savingProfile}
                            >
                                {savingProfile ? (
                                    <>
                                        <Loader2
                                            size={18}
                                            className="admin-settings-spinner"
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
                </div>
            </section>

            {/* ========================================
                PASSWORD SECTION
            ======================================== */}

            <section className="admin-settings-card">
                <div className="admin-settings-card-header">
                    <div>
                        <h2>Security</h2>

                        <p>
                            Change your administrator
                            account password.
                        </p>
                    </div>

                    <Lock size={22} />
                </div>

                <form
                    className="admin-settings-form"
                    onSubmit={
                        handlePasswordSubmit
                    }
                >
                    <div className="admin-settings-password-grid">
                        {/* CURRENT PASSWORD */}

                        <div className="admin-form-group">
                            <label htmlFor="current_password">
                                Current Password
                            </label>

                            <div className="admin-input-wrapper">
                                <Lock size={18} />

                                <input
                                    id="current_password"
                                    type={
                                        showCurrentPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="current_password"
                                    value={
                                        passwordData.current_password
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    placeholder="Enter current password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="admin-password-toggle"
                                    onClick={() =>
                                        setShowCurrentPassword(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                    title={
                                        showCurrentPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showCurrentPassword ? (
                                        <EyeOff
                                            size={18}
                                        />
                                    ) : (
                                        <Eye
                                            size={18}
                                        />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* NEW PASSWORD */}

                        <div className="admin-form-group">
                            <label htmlFor="password">
                                New Password
                            </label>

                            <div className="admin-input-wrapper">
                                <Lock size={18} />

                                <input
                                    id="password"
                                    type={
                                        showNewPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    value={
                                        passwordData.password
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    placeholder="Enter new password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="admin-password-toggle"
                                    onClick={() =>
                                        setShowNewPassword(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                    title={
                                        showNewPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showNewPassword ? (
                                        <EyeOff
                                            size={18}
                                        />
                                    ) : (
                                        <Eye
                                            size={18}
                                        />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* CONFIRM PASSWORD */}

                        <div className="admin-form-group">
                            <label htmlFor="password_confirmation">
                                Confirm New Password
                            </label>

                            <div className="admin-input-wrapper">
                                <Lock size={18} />

                                <input
                                    id="password_confirmation"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password_confirmation"
                                    value={
                                        passwordData.password_confirmation
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    placeholder="Confirm new password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="admin-password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                    title={
                                        showConfirmPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff
                                            size={18}
                                        />
                                    ) : (
                                        <Eye
                                            size={18}
                                        />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="admin-settings-form-actions">
                        <button
                            type="submit"
                            className="admin-settings-save-btn"
                            disabled={changingPassword}
                        >
                            {changingPassword ? (
                                <>
                                    <Loader2
                                        size={18}
                                        className="admin-settings-spinner"
                                    />
                                    Changing...
                                </>
                            ) : (
                                <>
                                    <Lock size={18} />
                                    Change Password
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </section>

            {/* ========================================
                SESSION SECTION
            ======================================== */}

            <section className="admin-settings-card admin-settings-danger-card">
                <div className="admin-settings-card-header">
                    <div>
                        <h2>Session Management</h2>

                        <p>
                            Sign out of your administrator
                            account on all connected devices.
                        </p>
                    </div>

                    <LogOut size={22} />
                </div>

                <div className="admin-settings-session-content">
                    <div>
                        <strong>
                            Logout from all devices
                        </strong>

                        <p>
                            This will invalidate all active
                            login sessions for your account.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="admin-settings-logout-all-btn"
                        onClick={handleLogoutAll}
                        disabled={loggingOutAll}
                    >
                        {loggingOutAll ? (
                            <>
                                <Loader2
                                    size={18}
                                    className="admin-settings-spinner"
                                />
                                Logging out...
                            </>
                        ) : (
                            <>
                                <LogOut size={18} />
                                Logout All Devices
                            </>
                        )}
                    </button>
                </div>
            </section>
        </div>
    );
};

export default AdminSettings;
