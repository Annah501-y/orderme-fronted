
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
    Settings,
    LogOut,
    Menu,
    ChevronLeft,
    Camera,
    ShoppingCart,
    Package,
    Store,
    WalletCards,
    LayoutDashboard,
} from "lucide-react";

import "../../pages_styles/seller_styles/seller-sidebar.css";

const API_URL = import.meta.env.VITE_API_URL;

function SellerSidebar({ collapsed, setCollapsed }) {
    const navigate = useNavigate();

    const [user, setUser] = React.useState(null);
    const [uploadingPhoto, setUploadingPhoto] = React.useState(false);

    /*
     * Load the latest user profile from Laravel.
     */
    React.useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await fetch(`${API_URL}/profile`, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message || "Unable to load profile."
                    );
                }

                const profileUser = result.data.user;

                const updatedUser = {
                    ...profileUser,
                    profile_photo_url:
                        result.data.profile_photo_url || null,
                };

                setUser(updatedUser);

                localStorage.setItem(
                    "user",
                    JSON.stringify(updatedUser)
                );
            } catch (error) {
                console.error("Unable to load seller profile:", error);

                /*
                 * Fall back to the cached user if the API request fails.
                 */
                const storedUser = localStorage.getItem("user");

                if (storedUser) {
                    try {
                        setUser(JSON.parse(storedUser));
                    } catch (storageError) {
                        console.error(
                            "Unable to load cached user:",
                            storageError
                        );
                    }
                }
            }
        };

        fetchProfile();
    }, [navigate]);

    /*
     * Logout
     */
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    const userName = user?.name || "Seller";

    /*
     * Get first letters of user's name
     * for the profile placeholder.
     */
    const getInitials = (name) => {
        return name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };

    /*
     * Upload profile picture to Laravel.
     */
    const handleProfileImageChange = async (e) => {
        const file = e.target.files[0];

        if (!file) {
            return;
        }

        /*
         * Validate file type.
         */
        if (!file.type.startsWith("image/")) {
            alert("Please select an image file.");
            e.target.value = "";
            return;
        }

        /*
         * Maximum 5MB.
         */
        if (file.size > 5 * 1024 * 1024) {
            alert("Please choose an image smaller than 5MB.");
            e.target.value = "";
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        try {
            setUploadingPhoto(true);

            const formData = new FormData();

            //http method is post, laravel interprates as put
            formData.append("_method", "PUT");

            formData.append("profile_photo", file);

            const response = await fetch(`${API_URL}/profile`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Failed to update profile picture."
                );
            }

            /*
             * Get updated user from Laravel.
             */
            const updatedUser = {
                ...result.data.user,
                profile_photo_url:
                    result.data.profile_photo_url || null,
            };

            /*
             * Update sidebar immediately.
             */
            setUser(updatedUser);

            /*
             * Update cached user.
             */
            localStorage.setItem(
                "user",
                JSON.stringify(updatedUser)
            );

        } catch (error) {
            console.error(
                "Profile image upload error:",
                error
            );

            alert(
                error.message ||
                    "Unable to update profile picture."
            );
        } finally {
            setUploadingPhoto(false);

            /*
             * Allow selecting the same image again.
             */
            e.target.value = "";
        }
    };

    return (
        <aside
            className={`seller-sidebar ${
                collapsed ? "collapsed" : ""
            }`}
        >
            {/* =========================
                PROFILE SECTION
            ========================= */}

            <div className="seller-profile">

                {/* PROFILE IMAGE + CAMERA */}

                <div className="profile-image-container">

                    {/* PROFILE IMAGE */}

                    <button
                        type="button"
                        className="profile-image-button"
                        onClick={() =>
                            navigate("/seller/profile")
                        }
                        title="Manage profile"
                    >
                        {user?.profile_photo_url ? (
                            <img
                                src={user.profile_photo_url}
                                alt={userName}
                                className="profile-image"
                            />
                        ) : (
                            <div className="profile-placeholder">
                                {getInitials(userName)}
                            </div>
                        )}
                    </button>

                    {/* CAMERA BUTTON */}

                    <label
                        htmlFor="sidebar-profile-image"
                        className="sidebar-camera-button"
                        title={
                            uploadingPhoto
                                ? "Uploading..."
                                : "Change profile picture"
                        }
                    >
                        <Camera size={13} />
                    </label>

                    {/* HIDDEN IMAGE INPUT */}

                    <input
                        id="sidebar-profile-image"
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                        hidden
                        disabled={uploadingPhoto}
                        onChange={
                            handleProfileImageChange
                        }
                    />
                </div>

                {!collapsed && (
                    <div className="profile-info">
                        <strong>{userName}</strong>
                    </div>
                )}
            </div>

            {/* =========================
                NAVIGATION
            ========================= */}

            <nav className="sidebar-nav">

                {/* Dashboard */}

                <NavLink
                    to="/seller-dashboard"
                    className={({ isActive }) =>
                        `sidebar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                    title="Dashboard"
                >
                    <LayoutDashboard size={20} />

                    {!collapsed && (
                        <span>Dashboard</span>
                    )}
                </NavLink>

                {/* Orders */}

                <NavLink
                    to="/seller/orders"
                    className={({ isActive }) =>
                        `sidebar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                    title="Orders"
                >
                    <ShoppingCart size={20} />

                    {!collapsed && (
                        <span>Orders</span>
                    )}
                </NavLink>

                {/* Products */}

                <NavLink
                    to="/seller/products"
                    className={({ isActive }) =>
                        `sidebar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                    title="Products"
                >
                    <Package size={20} />

                    {!collapsed && (
                        <span>Products</span>
                    )}
                </NavLink>

                {/* Store Profile */}

                <NavLink
                    to="/seller/store-profile"
                    className={({ isActive }) =>
                        `sidebar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                    title="Store"
                >
                    <Store size={20} />

                    {!collapsed && (
                        <span>Store Profile</span>
                    )}
                </NavLink>

                {/* Earnings */}

                <NavLink
                    to="/seller/earnings"
                    className={({ isActive }) =>
                        `sidebar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                    title="Earnings"
                >
                    <WalletCards size={20} />

                    {!collapsed && (
                        <span>Earnings</span>
                    )}
                </NavLink>

                {/* Settings */}

                <NavLink
                    to="/seller/settings"
                    className={({ isActive }) =>
                        `sidebar-link ${
                            isActive ? "active" : ""
                        }`
                    }
                    title="Settings"
                >
                    <Settings size={20} />

                    {!collapsed && (
                        <span>Settings</span>
                    )}
                </NavLink>

            </nav>

            {/* =========================
                LOGOUT
            ========================= */}

            <div className="sidebar-bottom">

                <button
                    type="button"
                    className="sidebar-link logout-link"
                    onClick={handleLogout}
                    title="Logout"
                >
                    <LogOut size={20} />

                    {!collapsed && (
                        <span>Logout</span>
                    )}
                </button>

            </div>

            {/* =========================
                COLLAPSE BUTTON
            ========================= */}

            <div className="sidebar-collapse">

                <button
                    type="button"
                    onClick={() =>
                        setCollapsed(!collapsed)
                    }
                    className="collapse-button"
                    title={
                        collapsed
                            ? "Expand sidebar"
                            : "Collapse sidebar"
                    }
                >
                    {collapsed ? (
                        <Menu size={20} />
                    ) : (
                        <ChevronLeft size={20} />
                    )}

                    {!collapsed && (
                        <span>Collapse</span>
                    )}
                </button>

            </div>

        </aside>
    );
}

export default SellerSidebar;
