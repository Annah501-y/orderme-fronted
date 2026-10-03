import React from "react";

function AboutUs() {
    return (
        <article className="container py-5">
            <header className="mb-4">
                <p className="text-uppercase text-secondary mb-2">
                    About OrderMe
                </p>

                <h1>About Us</h1>

                <p>
                    OrderMe is a Tanzanian marketplace designed to connect
                    customers with sellers and products in one convenient
                    online platform.
                </p>
            </header>

            <section className="mb-4">
                <h2 className="h4">What is OrderMe?</h2>

                <p>
                    OrderMe brings buyers and sellers together through a
                    digital marketplace where customers can discover products,
                    compare listings, place orders, and receive their purchases.
                </p>

                <p>
                    Our goal is to make online shopping more accessible,
                    convenient, and reliable for customers and local businesses
                    in Tanzania.
                </p>
            </section>

            <section className="mb-4">
                <h2 className="h4">For Customers</h2>

                <p>
                    Customers can browse different categories, discover
                    products from different sellers, manage their cart and
                    wishlist, place orders, and follow their orders through
                    OrderMe.
                </p>
            </section>

            <section className="mb-4">
                <h2 className="h4">For Sellers</h2>

                <p>
                    OrderMe provides sellers with a digital marketplace where
                    they can showcase their products, manage their listings,
                    receive orders, and grow their online presence.
                </p>
            </section>

            <section className="mb-4">
                <h2 className="h4">Our Vision</h2>

                <p>
                    We aim to build a trusted digital marketplace that makes
                    buying and selling easier while creating opportunities for
                    local businesses to reach more customers.
                </p>
            </section>

            <section>
                <h2 className="h4">Contact Us</h2>

                <p>
                    Have a question or need assistance? Contact our support
                    team at{" "}
                    <a href="mailto:support@ordreme.co.tz">
                        support@ordreme.co.tz
                    </a>.
                </p>
            </section>
        </article>
    );
}

export default AboutUs;