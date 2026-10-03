import React, { useEffect } from "react";
import { ArrowLeft, X } from "lucide-react";

import Terms from "../pages/Terms";
import Privacy from "../pages/Privacy";
import HelpCenter from "../pages/HelpCenter";
import AboutUs from "../pages/AboutUs";
import "../components_styles/footer-overlay.css";

function FooterOverlay({ type, onClose, onNavigate }) {
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);

        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    const renderContent = () => {
        switch (type) {
            case "help":
                return <HelpCenter />;
            case "about":
                return <AboutUs />;

            case "privacy":
                return <Privacy onOpenHelp={onNavigate} />;

            case "terms":
                return <Terms onOpenHelp={onNavigate} />;

            default:
                return null;
        }
    };

    const titles = {
        help: "Help Center",
        about: "About Us",
        privacy: "Privacy Policy",
        terms: "Terms & Conditions",
    };

    return (
        <div className="footer-overlay">

            <div
                className="footer-overlay-backdrop"
                onClick={onClose}
            />

            <div
                className="footer-overlay-panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby="footer-overlay-title"
            >
                <header className="footer-overlay-header">

                    <button
                        type="button"
                        className="footer-overlay-back-button"
                        onClick={onClose}
                        aria-label="Go back"
                    >
                        <ArrowLeft size={19} />
                        <span>Back</span>
                    </button>

                    <h2 id="footer-overlay-title">
                        {titles[type]}
                    </h2>

                    <button
                        type="button"
                        className="footer-overlay-close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X size={22} />
                    </button>

                </header>

                <main className="footer-overlay-content">
                    {renderContent()}
                </main>

            </div>
        </div>
    );
}

export default FooterOverlay;