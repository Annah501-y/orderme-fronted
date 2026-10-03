
import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Star, Store, BadgeCheck, ArrowRight } from "lucide-react";
import "../pages_styles/seller_styles/seller-card.css";

function SellerCard({ seller }) {
    return (
        <div className="seller-card">

            <div className="seller-top">

                <div className="seller-logo">
                    <Store size={28} />
                </div>

                {seller.verified && (
                    <span className="seller-verified">
                        <BadgeCheck size={15} />
                        Verified
                    </span>
                )}

            </div>

            <div className="seller-info">

                <h3>{seller.storeName || seller.name}</h3>

                {seller.category && (
                    <p className="seller-category">
                        {seller.category}
                    </p>
                )}

                {seller.location && (
                    <div className="seller-location">
                        <MapPin size={14} />
                        {seller.location}
                    </div>
                )}

                {seller.rating != null && (
                    <div className="seller-rating">
                        <Star size={15} fill="currentColor" />
                        <strong>{seller.rating}</strong>
                        {seller.reviews != null && (
                            <span>({seller.reviews} reviews)</span>
                        )}
                    </div>
                )}

            </div>

            <Link className="seller-button text-decoration-none" to={`/products?seller=${seller.id}`}>
                View Store Products
                <ArrowRight size={16} />
            </Link>

        </div>
    );
}

export default SellerCard;
