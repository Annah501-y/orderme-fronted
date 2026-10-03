import React, { useEffect, useState } from "react";
import {
    ShoppingBag,
    Package,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { fetchAllProducts, getProductImageUrl } from "../../api/marketplace";
import { submitProductReview } from "../../api/customerFeedback";

import "../../pages_styles/buyer_styles/buyer-order.css";

const API_URL = import.meta.env.VITE_API_URL;

/** Submit a review for a product the buyer purchased in this order. */
function ProductReviewForm({ orderId, productId }) {
    const [rating, setRating] = useState("5");
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");
        setError("");
        setSubmitting(true);

        try {
            const result = await submitProductReview({
                productId,
                orderId,
                rating: Number(rating),
                comment,
            });

            setMessage(result?.message || "Your review was submitted for approval.");
            setComment("");
        } catch (requestError) {
            const fieldErrors = requestError.response?.data?.errors;
            const firstFieldError = fieldErrors
                ? Object.values(fieldErrors).flat()[0]
                : null;

            setError(
                firstFieldError ||
                    requestError.response?.data?.message ||
                    "The review could not be submitted. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form className="buyer-product-review-form" onSubmit={handleSubmit}>
            <label htmlFor={`review-rating-${orderId}-${productId}`}>
                Your rating
            </label>
            <select
                id={`review-rating-${orderId}-${productId}`}
                value={rating}
                onChange={(event) => setRating(event.target.value)}
                required
            >
                <option value="5">5 — Excellent</option>
                <option value="4">4 — Very good</option>
                <option value="3">3 — Good</option>
                <option value="2">2 — Fair</option>
                <option value="1">1 — Poor</option>
            </select>

            <label htmlFor={`review-comment-${orderId}-${productId}`}>
                Comment <span>(optional)</span>
            </label>
            <textarea
                id={`review-comment-${orderId}-${productId}`}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                maxLength={5000}
                rows={3}
                placeholder="Share your experience with this product"
            />

            <button type="submit" disabled={submitting}>
                {submitting ? "Submitting…" : "Submit review"}
            </button>

            {message && <p className="review-success" role="status">{message}</p>}
            {error && <p className="review-error" role="alert">{error}</p>}
        </form>
    );
}

function BuyerOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedOrder, setExpandedOrder] = useState(null);

    const fetchOrders = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "/login";
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_URL}/orders`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to load orders."
                );
            }

            const catalog = await fetchAllProducts().catch(() => []);
            const catalogById = new Map(catalog.map((product) => [String(product.id), product]));
            const orderData = result.data?.data || [];
            setOrders(orderData.map((order) => ({
                ...order,
                items: (order.items || []).map((item) => {
                    const productId = item.product_id ?? item.product?.id;
                    const catalogProduct = catalogById.get(String(productId));
                    const product = item.product || catalogProduct;
                    if (!product) return item;
                    return {
                        ...item,
                        product: {
                            ...(catalogProduct || {}),
                            ...product,
                            image_url: getProductImageUrl(product) || getProductImageUrl(catalogProduct),
                        },
                    };
                }),
            })));
        } catch (error) {
            console.error("Orders error:", error);

            setError(
                error.message || "Unable to load your orders."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const formatPrice = (price) => {
        return `TSh ${Number(price || 0).toLocaleString()}`;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-TZ", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const toggleOrder = (orderId) => {
        setExpandedOrder(
            expandedOrder === orderId ? null : orderId
        );
    };

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case "pending":
                return "status-pending";

            case "confirmed":
                return "status-confirmed";

            case "processing":
                return "status-processing";

            case "shipped":
                return "status-shipped";

            case "delivered":
                return "status-delivered";

            case "cancelled":
                return "status-cancelled";

            default:
                return "status-default";
        }
    };

    if (loading) {
        return (
            <div className="buyer-orders-page">
                <div className="buyer-orders-state">
                    <div
                        className="spinner-border"
                        role="status"
                    ></div>

                    <p>Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="buyer-orders-page">
            <div className="container">

                <div className="buyer-orders-header">
                    <div>
                        
                        <h1>My Orders</h1>

                        <p>
                            View and track your orders.
                        </p>
                    </div>

                    <div className="orders-count">
                        <ShoppingBag size={18} />
                        <span>
                            {orders.length}{" "}
                            {orders.length === 1
                                ? "Order"
                                : "Orders"}
                        </span>
                    </div>
                </div>

                {error && (
                    <div className="buyer-orders-error">
                        {error}

                        <button
                            type="button"
                            onClick={fetchOrders}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!error && orders.length === 0 && (
                    <div className="buyer-orders-empty">
                        <Package size={50} />

                        <h3>No orders yet</h3>

                        <p>
                            Your orders will appear here after
                            you make a purchase.
                        </p>
                    </div>
                )}

                {!error && orders.length > 0 && (
                    <div className="orders-list">

                        {orders.map((order) => (
                            <div
                                className="order-card"
                                key={order.id}
                            >

                                <div className="order-card-header">

                                    <div>
                                        <span className="order-number">
                                            Order #{order.id}
                                        </span>

                                        <span className="order-date">
                                            {formatDate(
                                                order.created_at
                                            )}
                                        </span>
                                    </div>

                                    <span
                                        className={`order-status ${getStatusClass(
                                            order.status
                                        )}`}
                                    >
                                        {order.status}
                                    </span>

                                </div>

                                <div className="order-card-summary">

                                    <div>
                                        <span>Items</span>

                                        <strong>
                                            {order.items?.reduce(
                                                (sum, item) =>
                                                    sum +
                                                    Number(
                                                        item.quantity || 0
                                                    ),
                                                0
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Total</span>

                                        <strong>
                                            {formatPrice(
                                                order.total_amount
                                            )}
                                        </strong>
                                    </div>

                                    <button
                                        type="button"
                                        className="view-order-button"
                                        onClick={() =>
                                            toggleOrder(order.id)
                                        }
                                    >
                                        {expandedOrder ===
                                        order.id ? (
                                            <>
                                                Hide Details
                                                <ChevronUp
                                                    size={17}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                View Details
                                                <ChevronDown
                                                    size={17}
                                                />
                                            </>
                                        )}
                                    </button>

                                </div>

                                {expandedOrder ===
                                    order.id && (
                                    <div className="order-details">

                                        <h3>
                                            Order Items
                                        </h3>

                                        {order.items?.map((item) => {
                                            const productId = item.product?.id ?? item.product_id;

                                            return (
                                                <React.Fragment key={`${order.id}-${productId ?? item.id}`}>
                                                    <div className="order-item">

                                                    <div className="order-item-image">
                                                        {getProductImageUrl(item.product) ? (
                                                            <img
                                                                src={getProductImageUrl(item.product)}
                                                                alt={
                                                                    item
                                                                        .product
                                                                        .name
                                                                }
                                                            />
                                                        ) : (
                                                            <Package
                                                                size={
                                                                    28
                                                                }
                                                            />
                                                        )}
                                                    </div>

                                                    <div className="order-item-info">
                                                        <h4>
                                                            {
                                                                item
                                                                    .product
                                                                    ?.name
                                                            }
                                                        </h4>

                                                        <span>
                                                            Quantity:{" "}
                                                            {
                                                                item.quantity
                                                            }
                                                        </span>

                                                        <span>
                                                            Unit price:{" "}
                                                            {formatPrice(
                                                                item.unit_price
                                                            )}
                                                        </span>
                                                    </div>

                                                    <strong className="order-item-total">
                                                        {formatPrice(
                                                            item.total_price
                                                        )}
                                                    </strong>

                                                    </div>
                                                    {productId != null && (
                                                        <ProductReviewForm
                                                            orderId={order.id}
                                                            productId={productId}
                                                        />
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}

                                    </div>
                                )}

                            </div>
                        ))}

                    </div>
                )}

            </div>
        </div>
    );
}

export default BuyerOrders;
