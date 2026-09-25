import React from "react";
import { Link } from "react-router-dom";

function Privacy() {
    return (
        <article className="container py-5">
            <header className="mb-4">
                <p className="text-uppercase text-secondary mb-2">OrderMe Marketplace</p>
                <h1>Privacy Policy</h1>
                <p>This policy explains the personal information OrderMe uses to operate the marketplace.</p>
            </header>

            <section className="mb-4">
                <h2 className="h4">Information used by OrderMe</h2>
                <p>Depending on how you use the service, this may include your name, email address, phone number, profile photo, saved delivery addresses and location details, cart and wishlist contents, orders, seller profile information, and support communications.</p>
                <p>For payments, OrderMe may process the selected payment method, a mobile money phone number when required, and payment transaction references and status returned by the payment provider.</p>
            </section>

            <section className="mb-4">
                <h2 className="h4">How information is used</h2>
                <p>We use information to manage accounts and seller profiles, display marketplace listings, process orders and payments, calculate and coordinate delivery, respond to support requests, and protect the service from misuse.</p>
            </section>

            <section className="mb-4">
                <h2 className="h4">When information is shared</h2>
                <p>Information needed to fulfill an order may be shared with the relevant seller and delivery personnel. Payment details needed to process a transaction are shared with the selected payment provider. Service providers may process information to host and operate OrderMe. Information may also be disclosed when required by law or to protect users and the service.</p>
            </section>

            <section className="mb-4">
                <h2 className="h4">Storage and security</h2>
                <p>OrderMe uses technical and organizational measures intended to protect account and transaction information. Information is retained for as long as needed to provide the service, meet applicable obligations, resolve disputes, and maintain appropriate transaction records.</p>
            </section>

            <section className="mb-4">
                <h2 className="h4">Your choices and requests</h2>
                <p>You can review and update some account and address information in your profile. You may also contact us to ask about access, correction, or deletion of personal information. We may need to retain some records where required for orders, security, or legal obligations.</p>
            </section>

            <section>
                <h2 className="h4">Contact</h2>
                <p>For privacy questions or requests, email <a href="mailto:support@ordreme.co.tz">support@ordreme.co.tz</a> or visit the <Link to="/help">Help Center</Link>.</p>
            </section>
        </article>
    );
}

export default Privacy;
