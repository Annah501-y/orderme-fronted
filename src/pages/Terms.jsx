import React from "react";
import { Link } from "react-router-dom";

function Terms({ onOpenHelp }) {
    return (
        <article className="container py-5">
            <header className="mb-4">
                <p className="text-uppercase text-secondary mb-2">OrderMe Marketplace</p>
                <h1>Terms and Conditions</h1>
                <p>These terms describe the basic rules for using OrderMe.</p>
            </header>

            <section className="mb-4">
                <h2 className="h4">Using OrderMe</h2>
                <p>Use the marketplace lawfully and provide accurate information when creating an account, placing orders, or creating a seller profile. Keep your sign-in credentials secure and tell us if you believe your account has been used without permission.</p>
            </section>

            <section className="mb-4">
                <h2 className="h4">Products and sellers</h2>
                <p>Product descriptions, availability, and seller store information are supplied by marketplace sellers. Check the listing details before ordering. If a listing appears incorrect, contact support so it can be reviewed.</p>
            </section>

            <section className="mb-4">
                <h2 className="h4">Orders and payments</h2>
                <p>Orders are subject to product availability and seller processing. The checkout displays the order total and delivery calculation before you submit your order. Payment options are those shown at checkout and may be processed by a third-party payment provider.</p>
                <p>Order cancellation, return, and refund requests depend on the order status and the applicable seller and payment-provider process. Contact support with your order number for assistance.</p>
            </section>

            <section className="mb-4">
                <h2 className="h4">Delivery information</h2>
                <p>Provide a complete and accurate delivery address and reachable contact number. Delivery estimates can depend on the seller, location, and delivery conditions.</p>
            </section>

            <section className="mb-4">
                <h2 className="h4">Marketplace availability and changes</h2>
                <p>Features and listings may change as the marketplace is maintained. We may restrict access where necessary to protect users, sellers, or the service.</p>
            </section>

            <section>
                <h2 className="h4">Contact</h2>
                <p>
                    Questions about these terms? Contact{" "}
                    <a href="mailto:support@ordreme.co.tz">
                        support@ordreme.co.tz
                    </a>{" "}
                    or visit the{" "}
                    {onOpenHelp ? (
                        <button
                            type="button"
                            className="footer-document-link"
                            onClick={() => onOpenHelp("help")}
                        >
                            Help Center
                        </button>
                    ) : (
                        <Link to="/help">Help Center</Link>
                    )}
                    .
                </p>
            </section>
        </article>
    );
}

export default Terms;
