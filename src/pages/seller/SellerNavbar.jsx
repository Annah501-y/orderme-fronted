import { useState } from "react";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import "../../pages_styles/seller_styles/seller-navbar.css";

export default function SellerNavbar() {
    const navigate = useNavigate();
    const [accountOpen, setAccountOpen] = useState(false);

    let user = null;
    try {
        user = JSON.parse(localStorage.getItem("user") || "null");
    } catch {
        user = null;
    }

    const signOut = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("orderme:auth-changed"));
        navigate("/login", { replace: true });
    };

    return (
        <header className="seller-navbar">
            <div className="seller-navbar-inner">
                <Link to="/seller-dashboard" className="seller-navbar-brand">
                    <img
                        src="/src/assets/images/orderme-logo.jpg"
                        alt=""
                        className="seller-navbar-logo"
                    />
                    <span className="seller-navbar-wordmark">
                        Order<span>Me</span>
                    </span>
                </Link>

                <div className="seller-account-menu-wrap">
                    <button
                        type="button"
                        className="seller-account-trigger"
                        onClick={() => setAccountOpen((open) => !open)}
                        aria-expanded={accountOpen}
                        aria-haspopup="menu"
                    >
                        <UserRound size={19} aria-hidden="true" />
                        <span className="seller-account-name">
                            {user?.name || "Seller"}
                        </span>
                        <ChevronDown
                            size={16}
                            className={accountOpen ? "is-open" : ""}
                            aria-hidden="true"
                        />
                    </button>

                    {accountOpen && (
                        <div className="seller-account-dropdown" role="menu">
                            <div className="seller-account-heading">
                                <strong>{user?.name || "Seller"}</strong>
                                {user?.email && <small>{user.email}</small>}
                            </div>
                            <Link
                                to="/seller/settings"
                                role="menuitem"
                                onClick={() => setAccountOpen(false)}
                            >
                                <Settings size={17} aria-hidden="true" />
                                <span>Settings</span>
                            </Link>
                            <button
                                type="button"
                                className="seller-signout-button"
                                role="menuitem"
                                onClick={signOut}
                            >
                                <LogOut size={17} aria-hidden="true" />
                                <span>Sign out</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
