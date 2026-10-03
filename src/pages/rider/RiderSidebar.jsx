import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
    LayoutDashboard,
    Package,
    Wallet,
    User,
    Settings,
    LogOut,
    Bike,
    X,
    Camera,
    Menu,
    ChevronLeft,
    Sun,
    Moon,
} from "lucide-react";

import OrderMeLogo from "../../assets/images/orderme-logo.jpg";
import "../../pages_styles/rider-styles/rider-sidebar.css";


const API_URL = import.meta.env.VITE_API_URL;

const RiderSidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [theme, toggleTheme] = useTheme();

    const [user, setUser] = React.useState(null);
    const [uploadingPhoto, setUploadingPhoto] =
        React.useState(false);
    const [collapsed, setCollapsed] = React.useState(false);

    /*
    ========================================
    LOAD LATEST USER PROFILE FROM LARAVEL
    ========================================
    */

    React.useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await fetch(
                    `${API_URL}/profile`,
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
                            "Unable to load profile."
                    );
                }

                /*
                 * Get the user returned by Laravel.
                 */
                const profileUser =
                    result.data?.user || null;

                if (!profileUser) {
                    throw new Error(
                        "User profile was not returned."
                    );
                }

                /*
                 * Keep the profile photo URL returned
                 * by Laravel.
                 */
                const updatedUser = {
                    ...profileUser,
                    profile_photo_url:
                        result.data
                            ?.profile_photo_url ||
                        profileUser.profile_photo_url ||
                        null,
                };

                setUser(updatedUser);

                /*
                 * Save the latest Laravel user locally.
                 */
                localStorage.setItem(
                    "user",
                    JSON.stringify(updatedUser)
                );
            } catch (error) {
                console.error(
                    "Unable to load rider profile:",
                    error
                );

                /*
                 * Fall back to cached user if Laravel
                 * cannot be reached.
                 */
                const storedUser =
                    localStorage.getItem("user");

                if (storedUser) {
                    try {
                        setUser(
                            JSON.parse(storedUser)
                        );
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
    ========================================
    INITIALS
    ========================================
    */

    const getInitials = (name = "Rider") => {
        return name
            .trim()
            .split(/\s+/)
            .map((word) => word[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };

    const userName = user?.name || "Rider";

    /*
    ========================================
    PROFILE PHOTO UPLOAD
    ========================================
    */

    const handleProfileImageChange = async (e) => {
        const file = e.target.files?.[0];

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
            alert(
                "Please choose an image smaller than 5MB."
            );
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

            /*
             * Laravel receives this as PUT.
             */
            formData.append("_method", "PUT");

            formData.append(
                "profile_photo",
                file
            );

            const response = await fetch(
                `${API_URL}/profile`,
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

            /*
             * Get updated user from Laravel.
             */
            const updatedUser = {
                ...(result.data?.user || user),

                profile_photo_url:
                    result.data
                        ?.profile_photo_url ||
                    result.data?.user
                        ?.profile_photo_url ||
                    null,
            };

            /*
             * Update sidebar immediately.
             */
            setUser(updatedUser);

            /*
             * Save updated user locally.
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

    /*
    ========================================
    LOGOUT
    ========================================
    */

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    /*
    ========================================
    NAVIGATION
    ========================================
    */

    const navigationItems = [
        {
            name: "Dashboard",
            path: "/rider/dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "My Orders",
            path: "/rider/orders",
            icon: Package,
        },
        {
            name: "Earnings",
            path: "/rider/earnings",
            icon: Wallet,
        },
        {
            name: "My Profile",
            path: "/rider/profile",
            icon: User,
        },
        {
            name: "Settings",
            path: "/rider/settings",
            icon: Settings,
        },
    ];

    return (
        <>
            {/* MOBILE OVERLAY */}

            {isOpen && (
                <div
                    className="rider-sidebar-overlay"
                    onClick={onClose}
                ></div>
            )}

            <aside
                className={`rider-sidebar ${
                    isOpen
                        ? "sidebar-open"
                        : ""
                } ${
                    collapsed
                        ? "rider-sidebar-collapsed"
                        : ""
                }`}
            >

                {/* =========================
                    BRAND
                ========================= */}

                <div className="rider-sidebar-brand">
                    <NavLink
                        to="/rider/dashboard"
                        className="rider-brand-link"
                        onClick={onClose}
                    >
                        <img
                            src={OrderMeLogo}
                            alt="OrderMe"
                            className="rider-logo"
                        />

                        {!collapsed && (
                            <span className="rider-brand-text">
                                Order<span>Me</span>
                            </span>
                        )}
                    </NavLink>

                    <button type="button" className="theme-toggle-button" onClick={toggleTheme} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
                        {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
                    </button>

                    <button
                        className="rider-sidebar-close"
                        onClick={onClose}
                        type="button"
                        aria-label="Close sidebar"
                    >
                        <X size={22} />
                    </button>
                </div>


                {/* =========================
                    RIDER PROFILE
                ========================= */}

                <div className="rider-profile">

                    <div className="rider-profile-photo-wrapper">

                        {user?.profile_photo_url ? (
                            <img
                                src={
                                    user.profile_photo_url
                                }
                                alt={userName}
                                className="rider-profile-photo"
                            />
                        ) : (
                            <div className="rider-profile-initials">
                                {getInitials(userName)}
                            </div>
                        )}

                        {/* CAMERA */}

                        <label
                            htmlFor="rider-profile-photo"
                            className="rider-photo-button"
                            title={
                                uploadingPhoto
                                    ? "Uploading..."
                                    : "Change profile photo"
                            }
                        >
                            {uploadingPhoto ? (
                                <span className="photo-loading">
                                    ...
                                </span>
                            ) : (
                                <Camera size={11} />
                            )}
                        </label>

                        {/* HIDDEN INPUT */}

                        <input
                            id="rider-profile-photo"
                            type="file"
                            accept="image/jpeg,image/png,image/jpg,image/webp"
                            onChange={
                                handleProfileImageChange
                            }
                            disabled={uploadingPhoto}
                            hidden
                        />
                    </div>

                    {!collapsed && (
                        <div className="rider-profile-info">
                            <h6>{userName}</h6>

                            <span>
                                <Bike size={12} />
                                Rider
                            </span>
                        </div>
                    )}
                </div>


                {/* =========================
                    NAVIGATION
                ========================= */}

                <div className="rider-navigation">

                    {!collapsed && (
                        <p className="rider-nav-title">
                            MENU
                        </p>
                    )}

                    <nav>
                        {navigationItems.map(
                            (item) => {
                                const Icon =
                                    item.icon;

                                return (
                                    <NavLink
                                        key={
                                            item.path
                                        }
                                        to={
                                            item.path
                                        }
                                        onClick={
                                            onClose
                                        }
                                        title={
                                            collapsed
                                                ? item.name
                                                : undefined
                                        }
                                        className={({
                                            isActive,
                                        }) =>
                                            `rider-nav-link ${
                                                isActive
                                                    ? "active"
                                                    : ""
                                            }`
                                        }
                                    >
                                        <Icon
                                            size={20}
                                        />

                                        {!collapsed && (
                                            <span>
                                                {
                                                    item.name
                                                }
                                            </span>
                                        )}
                                    </NavLink>
                                );
                            }
                        )}
                    </nav>
                </div>


                {/* =========================
                    LOGOUT
                ========================= */}

                <div className="rider-sidebar-bottom">

                    <button
                        type="button"
                        className="rider-logout-button"
                        onClick={handleLogout}
                        title={
                            collapsed
                                ? "Logout"
                                : undefined
                        }
                    >
                        <LogOut size={20} />

                        {!collapsed && (
                            <span>Logout</span>
                        )}
                    </button>
                </div>


                {/* =========================
                    COLLAPSE
                ========================= */}

                <div className="rider-sidebar-collapse">

                    <button
                        type="button"
                        onClick={() =>
                            setCollapsed(
                                !collapsed
                            )
                        }
                        className="rider-collapse-button"
                        title={
                            collapsed
                                ? "Expand sidebar"
                                : "Collapse sidebar"
                        }
                    >
                        {collapsed ? (
                            <Menu size={20} />
                        ) : (
                            <ChevronLeft
                                size={20}
                            />
                        )}

                        {!collapsed && (
                            <span>Collapse</span>
                        )}
                    </button>
                </div>

            </aside>
        </>
    );
};

export default RiderSidebar;
