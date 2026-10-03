import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

import FooterOverlay from "./FooterOverlay";

import "../components_styles/footer.css";

function Footer() {
    const [overlay, setOverlay] = useState(null);

    const openOverlay = (type) => {
        setOverlay(type);
    };

    const closeOverlay = () => {
        setOverlay(null);
    };

    return (
        <>
            <footer className="footer-section">
                <div className="container">
                    <div className="row g-5">

                        {/* Brand */}
                        <div className="col-lg-4 col-md-6">
                            <Link
                                to="/"
                                className="footer-brand text-decoration-none"
                            >
                                Order<span>Me</span>
                            </Link>

                            <p className="footer-description">
                                OrderMe is a Tanzanian marketplace connecting
                                customers with sellers and products.
                            </p>
                        </div>

                        {/* Marketplace */}
                        <div className="col-6 col-lg-2 col-md-3">
                            <h3 className="footer-heading">
                                Marketplace
                            </h3>

                            <ul className="footer-links">
                                <li>
                                    <Link to="/allcategories">
                                        Categories
                                    </Link>
                                </li>

                                <li>
                                    <Link to="/products">
                                        Products
                                    </Link>
                                </li>

                                <li>
                                    <Link to="/deals">
                                        deals
                                    </Link>
                                </li>

                                <li>
                                    <Link to="/sellers">
                                        Top Sellers
                                    </Link>
                                </li>

                                <li>
                                    <Link to="/products">
                                        New Arrivals
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Help */}
                        <div className="col-6 col-lg-2 col-md-3">
                            <h3 className="footer-heading">Help &amp; Support</h3>

                            <ul className="footer-links">
                                <li>
                                    <button
                                        type="button"
                                        className="footer-action-link"
                                        onClick={() => openOverlay("help")}
                                    >
                                        Help Center
                                    </button>
                                </li>

                                <li>
                                    <button
                                        type="button"
                                        className="footer-action-link"
                                        onClick={() => openOverlay("about")}
                                    >
                                        About Us
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div className="col-lg-4 col-md-6">
                            <h3 className="footer-heading">
                                Contact Us
                            </h3>

                            <div className="footer-contact">

                                <div>
                                    <MapPin size={17} />
                                    <span>Tanzania</span>
                                </div>

                                <div>
                                    <Phone size={17} />

                                    <a
                                        href="tel:+255618770830"
                                        style={{
                                            color: "inherit",
                                            textDecoration: "none",
                                        }}
                                    >
                                        Call: +255 618770830
                                    </a>
                                </div>

                                <div>
                                    <Phone size={17} />

                                    <a
                                        href="https://wa.me/255618770830"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            color: "inherit",
                                            textDecoration: "none",
                                        }}
                                    >
                                        WhatsApp: +255 618770830
                                    </a>
                                </div>

                                <div>
                                    <Mail size={17} />

                                    <a
                                        href="mailto:support@ordreme.co.tz"
                                        style={{
                                            color: "inherit",
                                            textDecoration: "none",
                                        }}
                                    >
                                        support@ordreme.co.tz
                                    </a>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Bottom */}
                    <div className="footer-bottom">
                        <p>
                            © {new Date().getFullYear()} OrderMe.
                            All rights reserved.
                        </p>

                        <div className="footer-bottom-links">

                            <button
                                type="button"
                                className="footer-action-link"
                                onClick={() => openOverlay("privacy")}
                            >
                                Privacy Policy
                            </button>

                            <button
                                type="button"
                                className="footer-action-link"
                                onClick={() => openOverlay("terms")}
                            >
                                Terms &amp; Conditions
                            </button>

                        </div>
                    </div>
                </div>
            </footer>

            {/* Overlay */}
            {overlay && (
                <FooterOverlay
                    type={overlay}
                    onClose={closeOverlay}
                    onNavigate={setOverlay}
                />
            )}
        </>
    );
}

export default Footer;