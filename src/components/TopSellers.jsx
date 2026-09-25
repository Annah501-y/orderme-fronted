import React, { useEffect, useState } from "react";
import SellerCard from "../components/SellerCard";
import { fetchAllProducts, groupProductsBySeller } from "../api/marketplace";
import { Link } from "react-router-dom";

import "../components_styles/top-sellers.css";

function TopSellers() {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isCurrent = true;

        const loadSellers = async () => {
            try {
                const products = await fetchAllProducts();
                if (isCurrent) {
                    setSellers(
                        groupProductsBySeller(products)
                            .sort((left, right) => right.productCount - left.productCount || left.storeName.localeCompare(right.storeName))
                            .slice(0, 4)
                    );
                }
            } catch (loadError) {
                if (isCurrent) {
                    setError(loadError.message || "Unable to load top sellers.");
                }
            } finally {
                if (isCurrent) {
                    setLoading(false);
                }
            }
        };

        loadSellers();
        return () => {
            isCurrent = false;
        };
    }, []);

    return (
        <section className="top-sellers-section">
            <div className="container">
                <div className="top-sellers-header">
                    <div>
                        <span className="top-sellers-label">TRUSTED MARKETPLACE</span>
                        <h2 className="top-sellers-title">Top Sellers</h2>
                        <p className="top-sellers-description">
                            Discover sellers with the most active products on the OrderMe marketplace.
                        </p>
                    </div>
                    <Link className="top-sellers-view-button text-decoration-none" to="/sellers">
                        View All Sellers
                    </Link>
                </div>

                {error && <p role="alert">{error}</p>}
                {loading ? (
                    <p>Loading sellers...</p>
                ) : sellers.length === 0 ? (
                    <p>No active sellers to display yet.</p>
                ) : (
                    <div className="row g-4">
                        {sellers.map((seller) => (
                            <div className="col-12 col-sm-6 col-lg-3" key={seller.id}>
                                <SellerCard seller={seller} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export default TopSellers;
