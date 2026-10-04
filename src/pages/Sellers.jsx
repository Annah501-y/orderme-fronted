import React, { useEffect, useState } from "react";
import { fetchAllProducts, groupProductsBySeller } from "../api/marketplace";
import SellerCard from "../components/SellerCard";
import "../pages_styles/seller_styles/seller-card.css";

function Sellers() {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isCurrent = true;

        // Build storefront listings from the public product catalog and its seller relationships.
        fetchAllProducts()
            .then((products) => {
                if (isCurrent) {
                    setSellers(
                        groupProductsBySeller(products).sort((left, right) =>
                            left.storeName.localeCompare(right.storeName)
                        )
                    );
                }
            })
            .catch((loadError) => {
                if (isCurrent) {
                    setError(loadError.message || "Unable to load sellers.");
                }
            })
            .finally(() => {
                if (isCurrent) {
                    setLoading(false);
                }
            });

        return () => {
            isCurrent = false;
        };
    }, []);

    return (
        <main className="container py-5">
            <header className="mb-4">
                <p className="text-uppercase text-secondary mb-2">OrderMe Marketplace</p>
                <h1>Explore Sellers and Stores</h1>
                <p>Browse stores and the active products listed by each seller.</p>
            </header>

            {loading && <p>Loading stores...</p>}
            {error && <p role="alert">{error}</p>}
            {!loading && !error && sellers.length === 0 && (
                <p>No sellers with active products were found.</p>
            )}

            {!loading && !error && sellers.length > 0 && (
                <div className="row g-4">
                    {sellers.map((seller) => (
                        <section className="col-12 col-md-6 col-xl-4" key={seller.id}>
                            <SellerCard seller={seller} />
                        </section>
                    ))}
                </div>
            )}
        </main>
    );
}

export default Sellers;
