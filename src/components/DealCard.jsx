import React from "react";
import { ArrowRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

function DealCard({ deal }) {
    const navigate = useNavigate();

    const handleShopDeal = () => {
        navigate(`/products/${deal.id}`);
    };

    return (
        <div
            className="deal-card"
            style={{
                backgroundImage: `url(${deal.image_url})`,
            }}
        >
            <div className="deal-overlay"></div>

            <div className="deal-content">

                <span className="deal-badge">
                    {deal.discount}% OFF
                </span>

                <h3>{deal.name}</h3>

                <p>
                    {deal.description ||
                        "Special offer from an OrderMe seller."}
                </p>

                <div className="deal-time">
                    <Clock size={15} />
                    Special Deal
                </div>

                <button
                    className="deal-button"
                    onClick={handleShopDeal}
                >
                    Shop Deal
                    <ArrowRight size={17} />
                </button>

            </div>
        </div>
    );
}

export default DealCard;