
import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Star, Store, BadgeCheck, ArrowRight } from "lucide-react";
import { getProductImageUrl } from "../api/marketplace";
import "../pages_styles/seller_styles/seller-card.css";

function SellerCard({ seller }) {
    return (
        <div className="seller-card">

            <div className="seller-top">

                <div className="seller-logo">
                    {getProductImageUrl({ image: seller.profilePicture }) ? (
                        <img
                            className="seller-profile-image"
                            src={getProductImageUrl({ image: seller.profilePicture })}
                            alt={`${seller.name || "Seller"} profile`}
                        />
                    ) : (
                        <Store size={28} aria-hidden="true" />
                    )}
                </div>

                {seller.verified && (
                    <span className="seller-verified">
                        <BadgeCheck size={15} />
                        Verified
                    </span>
                )}

            </div>

            <div className="seller-info">

                <h3>{seller.storeName || "Store"}</h3>

                <p className="seller-owner">
                    Owner: <strong>{seller.name || "Marketplace seller"}</strong>
                </p>

                {(seller.categoryNames?.length > 0 || seller.category) && (
                    <div className="seller-category-list" aria-label="Store product categories">
                        {(seller.categoryNames?.length ? seller.categoryNames : [seller.category]).map((category) => (
                            <span className="seller-category-chip" key={category}>
                                {category}
                            </span>
                        ))}
                    </div>
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
