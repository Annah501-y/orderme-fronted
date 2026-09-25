import React, { useEffect, useState } from "react";
import DealCard from "./DealCard";

import "../components_styles/deal-card.css";
import "../components_styles/deals.css";

const API_URL = import.meta.env.VITE_API_URL;

function Deals() {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDeals = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(`${API_URL}/deals`);

                if (!response.ok) {
                    throw new Error("Failed to fetch deals.");
                }

                const result = await response.json();

                setDeals(result.data || []);
            } catch (error) {
                console.error("Deals error:", error);
                setError("Unable to load deals at the moment.");
            } finally {
                setLoading(false);
            }
        };

        fetchDeals();
    }, []);

    return (
        <section className="deals-section" id="deals">

            <div className="container">

                <div className="deals-header">

                    <div>
                        <span className="deals-label">
                            SPECIAL OFFERS
                        </span>

                        <h2 className="deals-title">
                            Deals You Don't Want to Miss
                        </h2>

                        <p className="deals-description">
                            Get more value from your shopping experience
                            with exclusive offers from OrderMe sellers.
                        </p>
                    </div>

                </div>

                {loading && (
                    <div className="text-center py-4">
                        <p>Loading deals...</p>
                    </div>
                )}

                {error && !loading && (
                    <div className="text-center py-4">
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && deals.length === 0 && (
                    <div className="text-center py-4">
                        <p>
                            No special deals are available right now.
                        </p>
                    </div>
                )}

                {!loading && !error && deals.length > 0 && (
                    <div className="row g-4">

                        {deals.map((deal) => (
                            <div
                                className="col-12 col-lg-6"
                                key={deal.id}
                            >
                                <DealCard deal={deal} />
                            </div>
                        ))}

                    </div>
                )}

            </div>

        </section>
    );
}

export default Deals;
