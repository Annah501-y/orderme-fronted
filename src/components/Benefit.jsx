
import React from "react";
import {
    ShieldCheck,
    BadgeCheck,
    Truck,
    Headphones,
} from "lucide-react";

import heroBackground from "../assets/images/hero-background.jpg";

import "../components_styles/benefit.css";

const benefits = [
    {
        icon: ShieldCheck,
        title: "Secure Payments",
        description:
            "Shop confidently with secure and reliable payment options.",
    },
    {
        icon: BadgeCheck,
        title: "Verified Sellers",
        description:
            "Discover trusted businesses and verified sellers on OrderMe.",
    },
    {
        icon: Truck,
        title: "Reliable Delivery",
        description:
            "Get your purchases delivered conveniently to your location.",
    },
    {
        icon: Headphones,
        title: "Customer Support",
        description:
            "Our support team is available to help when you need us.",
    },
];

function Benefits() {
    return (
        <section
            className="benefits-section"
            style={{
                backgroundImage: `url(${heroBackground})`,
            }}
        >
            <div className="benefits-overlay"></div>

            <div className="container position-relative">

                <div className="benefits-header">

                    <span className="benefits-label">
                        SHOP WITH CONFIDENCE
                    </span>

                    <h2 className="benefits-title">
                        Why Shop With OrderMe?
                    </h2>

                    <p className="benefits-description">
                        We are building a marketplace designed around
                        trusted sellers, secure shopping, and a better
                        experience for customers across Tanzania.
                    </p>

                </div>

                <div className="row g-4">

                    {benefits.map((benefit) => {
                        const Icon = benefit.icon;

                        return (
                            <div
                                className="col-12 col-sm-6 col-lg-3"
                                key={benefit.title}
                            >
                                <div className="benefit-card">

                                    <div className="benefit-icon">
                                        <Icon
                                            size={30}
                                            strokeWidth={1.6}
                                        />
                                    </div>

                                    <h3>
                                        {benefit.title}
                                    </h3>

                                    <p>
                                        {benefit.description}
                                    </p>

                                </div>
                            </div>
                        );
                    })}

                </div>

            </div>
        </section>
    );
}

export default Benefits;
