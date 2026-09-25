import React, { useEffect, useRef, useState } from "react";
import {
    Sun,
    Moon,
    Camera,
    LogOut,
    Settings,
    User,
    ChevronDown,
    X,
    Upload,
    Loader2,
} from "lucide-react";

import "../../pages_styles/admin-styles/admin-navbar.css";
import { useTheme } from "../../theme";

const API_URL = import.meta.env.VITE_API_URL;

const AdminNavbar = () => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    const [theme, toggleTheme] = useTheme();
    const darkMode = theme === "dark";

    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);

    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [previewPhoto, setPreviewPhoto] = useState(null);

    const [uploading, setUploading] = useState(false);

    const profileMenuRef = useRef(null);
    const fileInputRef = useRef(null);

    const token = localStorage.getItem("token");

    /*
    |--------------------------------------------------------------------------
    | Fetch admin information
    |--------------------------------------------------------------------------
    */

    const fetchAdmin = async () => {
        try {
            setLoading(true);

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
                        "Failed to load admin information."
                );
            }

            setAdmin(result.data);
        } catch (error) {
            console.error(
                "Failed to load admin information:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmin();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Close profile menu when clicking outside
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                profileMenuRef.current &&
                !profileMenuRef.current.contains(event.target)
            ) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Profile photo selection
    |--------------------------------------------------------------------------
    */

    const handlePhotoSelect = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setSelectedPhoto(file);

        const previewUrl = URL.createObjectURL(file);

        setPreviewPhoto(previewUrl);
    };

    /*
    |--------------------------------------------------------------------------
    | Upload profile photo
    |--------------------------------------------------------------------------
    */

    const handlePhotoUpload = async () => {
        if (!selectedPhoto) {
            return;
        }

        try {
            setUploading(true);

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
                        "Failed to update profile photo."
                );
            }

            setAdmin((previous) => ({
                ...previous,
                profile_photo:
                    result.data.profile_photo,
            }));

            setShowPhotoModal(false);
            setSelectedPhoto(null);
            setPreviewPhoto(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (error) {
            alert(
                error.message ||
                    "Failed to update profile photo."
            );
        } finally {
            setUploading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Open photo modal
    |--------------------------------------------------------------------------
    */

    const openPhotoModal = () => {
        setShowProfileMenu(false);
        setShowPhotoModal(true);
    };

    /*
    |--------------------------------------------------------------------------
    | Close photo modal
    |--------------------------------------------------------------------------
    */

    const closePhotoModal = () => {
        if (uploading) {
            return;
        }

        setShowPhotoModal(false);
        setSelectedPhoto(null);
        setPreviewPhoto(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Logout
    |--------------------------------------------------------------------------
    */

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";
    };

    /*
    |--------------------------------------------------------------------------
    | Profile image
    |--------------------------------------------------------------------------
    */

    const getProfileImage = () => {
        if (admin?.profile_photo) {
            return admin.profile_photo;
        }

        return null;
    };

    const profileImage = getProfileImage();

    return (
        <>
            <header className="admin-navbar">
                <div className="admin-navbar-left">
                    <div className="admin-navbar-brand">
                        <span className="admin-navbar-brand-main">
                            Order
                        </span>

                        <span className="admin-navbar-brand-accent">
                            Me
                        </span>
                    </div>

                    <div className="admin-navbar-divider"></div>

                    <div className="admin-navbar-title">
                        Admin Panel
                    </div>
                </div>

                <div className="admin-navbar-right">
                    {/* Theme Toggle */}
                    <button
                        type="button"
                        className="admin-theme-toggle"
                        onClick={toggleTheme}
                        title={
                            darkMode
                                ? "Switch to light mode"
                                : "Switch to dark mode"
                        }
                    >
                        {darkMode ? (
                            <Sun size={19} />
                        ) : (
                            <Moon size={19} />
                        )}
                    </button>

                    {/* Profile */}
                    <div
                        className="admin-navbar-profile"
                        ref={profileMenuRef}
                    >
                        <button
                            type="button"
                            className="admin-profile-button"
                            onClick={() =>
                                setShowProfileMenu(
                                    (previous) => !previous
                                )
                            }
                        >
                            <div className="admin-profile-image">
                                {loading ? (
                                    <Loader2
                                        size={18}
                                        className="admin-navbar-spinner"
                                    />
                                ) : profileImage ? (
                                    <img
                                        src={profileImage}
                                        alt={
                                            admin?.name ||
                                            "Admin"
                                        }
                                    />
                                ) : (
                                    <User size={20} />
                                )}
                            </div>

                            <div className="admin-profile-info">
                                <strong>
                                    {admin?.name ||
                                        "Administrator"}
                                </strong>

                                <span>Administrator</span>
                            </div>

                            <ChevronDown
                                size={17}
                                className={
                                    showProfileMenu
                                        ? "profile-chevron rotate"
                                        : "profile-chevron"
                                }
                            />
                        </button>

                        {showProfileMenu && (
                            <div className="admin-profile-dropdown">
                                <div className="admin-dropdown-header">
                                    <div className="admin-dropdown-image">
                                        {profileImage ? (
                                            <img
                                                src={
                                                    profileImage
                                                }
                                                alt={
                                                    admin?.name ||
                                                    "Admin"
                                                }
                                            />
                                        ) : (
                                            <User size={22} />
                                        )}
                                    </div>

                                    <div>
                                        <strong>
                                            {admin?.name ||
                                                "Administrator"}
                                        </strong>

                                        <span>
                                            {admin?.email || ""}
                                        </span>
                                    </div>
                                </div>

                                <div className="admin-dropdown-divider"></div>

                                <button
                                    type="button"
                                    onClick={
                                        openPhotoModal
                                    }
                                >
                                    <Camera size={17} />
                                    Change Profile Picture
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        (window.location.href =
                                            "/admin/settings")
                                    }
                                >
                                    <Settings size={17} />
                                    Account Settings
                                </button>

                                <div className="admin-dropdown-divider"></div>

                                <button
                                    type="button"
                                    className="admin-dropdown-logout"
                                    onClick={
                                        handleLogout
                                    }
                                >
                                    <LogOut size={17} />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Profile Photo Modal */}
            {showPhotoModal && (
                <div
                    className="admin-photo-modal-overlay"
                    onClick={closePhotoModal}
                >
                    <div
                        className="admin-photo-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="admin-photo-modal-header">
                            <div>
                                <h2>
                                    Change Profile Picture
                                </h2>

                                <p>
                                    Choose a new photo for
                                    your admin account.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closePhotoModal
                                }
                                disabled={uploading}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="admin-photo-preview">
                            {previewPhoto ? (
                                <img
                                    src={previewPhoto}
                                    alt="Selected profile"
                                />
                            ) : profileImage ? (
                                <img
                                    src={profileImage}
                                    alt="Current profile"
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
                            className="admin-photo-select-btn"
                            onClick={() =>
                                fileInputRef.current?.click()
                            }
                            disabled={uploading}
                        >
                            <Upload size={18} />
                            Choose Photo
                        </button>

                        {selectedPhoto && (
                            <p className="admin-photo-file-name">
                                {selectedPhoto.name}
                            </p>
                        )}

                        <div className="admin-photo-modal-actions">
                            <button
                                type="button"
                                className="admin-photo-cancel-btn"
                                onClick={closePhotoModal}
                                disabled={uploading}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="admin-photo-save-btn"
                                onClick={
                                    handlePhotoUpload
                                }
                                disabled={
                                    !selectedPhoto ||
                                    uploading
                                }
                            >
                                {uploading ? (
                                    <>
                                        <Loader2
                                            size={18}
                                            className="admin-navbar-spinner"
                                        />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={18} />
                                        Save Photo
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminNavbar;
