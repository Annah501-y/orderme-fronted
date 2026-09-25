import React from "react";
import { Link } from "react-router-dom";

function HelpCenter() {
    return (
        <section className="container py-5">
            <header className="mb-4">
                <p className="text-uppercase text-secondary mb-2">OrderMe Support</p>
                <h1>Help Center</h1>
                <p>Find products, learn how ordering works, or contact our support team.</p>
            </header>

            <div className="row g-4">
                <article className="col-md-6">
                    <h2 className="h4">Finding products and sellers</h2>
                    <p>Search the marketplace or browse categories and seller stores to view current listings.</p>
                    <p><Link to="/products">Browse products</Link></p>
                    <p><Link to="/allcategories">Browse categories</Link></p>
                    <p><Link to="/sellers">Explore sellers</Link></p>
                </article>
                <article className="col-md-6">
                    <h2 className="h4">Orders and delivery</h2>
                    <p>Sign in to place an order, choose a saved delivery address, and follow order updates from your account.</p>
                    <p>For help with a specific order, include its order number when contacting support.</p>
                </article>
                <article className="col-md-6">
                    <h2 className="h4">Payments</h2>
                    <p>Available payment methods are shown during checkout. Payment processing may be handled by the selected payment provider.</p>
                </article>
                <article className="col-md-6">
                    <h2 className="h4">Contact support</h2>
                    <p>
                        WhatsApp: <a href="https://wa.me/255618770830" target="_blank" rel="noopener noreferrer">+255 618770830</a>
                    </p>
                    <p>Call: <a href="tel:+255618770830">+255 618770830</a></p>
                    <p>Email: <a href="mailto:support@ordreme.co.tz">support@ordreme.co.tz</a></p>
                </article>
            </div>
        </section>
    );
}

export default HelpCenter;
