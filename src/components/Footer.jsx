import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

import "../components_styles/footer.css";

function Footer() {
    return (
        <footer className="footer-section">
            <div className="container">
                <div className="row g-5">
                    <div className="col-lg-4 col-md-6">
                        <Link to="/" className="footer-brand text-decoration-none">
                            Order<span>Me</span>
                        </Link>
                        <p className="footer-description">
                            OrderMe is a Tanzanian marketplace connecting customers with sellers and products.
                        </p>
                    </div>

                    <div className="col-6 col-lg-2 col-md-3">
                        <h3 className="footer-heading">Marketplace</h3>
                        <ul className="footer-links">
                            <li><Link to="/allcategories">Categories</Link></li>
                            <li><Link to="/products">Products</Link></li>
                            <li><Link to="/deals">Deals</Link></li>
                            <li><Link to="/sellers">Top Sellers</Link></li>
                            <li><Link to="/products">New Arrivals</Link></li>
                        </ul>
                    </div>

                    <div className="col-6 col-lg-2 col-md-3">
                        <h3 className="footer-heading">Help &amp; Support</h3>
                        <ul className="footer-links">
                            <li><Link to="/help">Help Center</Link></li>
                        </ul>
                    </div>

                    <div className="col-lg-4 col-md-6">
                        <h3 className="footer-heading">Contact Us</h3>
                        <div className="footer-contact">
                            <div><MapPin size={17} /><span>Tanzania</span></div>
                            <div><Phone size={17} /><a href="tel:+255618770830" style={{ color: "inherit", textDecoration: "none" }}>Call: +255 618770830</a></div>
                            <div><Phone size={17} /><a href="https://wa.me/255618770830" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>WhatsApp: +255 618770830</a></div>
                            <div><Mail size={17} /><a href="mailto:support@ordreme.co.tz" style={{ color: "inherit", textDecoration: "none" }}>support@ordreme.co.tz</a></div>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© {new Date().getFullYear()} OrderMe. All rights reserved.</p>
                    <div className="footer-bottom-links">
                        <Link to="/privacy">Privacy Policy</Link>
                        <Link to="/terms">Terms &amp; Conditions</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
