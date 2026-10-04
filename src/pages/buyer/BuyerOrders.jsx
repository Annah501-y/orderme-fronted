import React, { useEffect, useState } from "react";
import {
    ShoppingBag,
    Package,
    ChevronDown,
    ChevronUp,
    Star,
    RefreshCw,
} from "lucide-react";
import { fetchAllProducts, getProductImageUrl } from "../../api/marketplace";
import { submitProductReview } from "../../api/customerFeedback";
import GeneralFeedbackForm from "../../components/feedback/GeneralFeedbackForm";

import "../../pages_styles/buyer_styles/buyer-order.css";

const API_URL = import.meta.env.VITE_API_URL;

function getSellerOrderStatusLabel(status) {
    const labels = {
        ready_for_delivery: "Ready for delivery",
        picked_up: "Picked up",
        out_for_delivery: "Out for delivery",
        delivered: "Delivered",
    };

    return labels[status] || status?.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Pending";
}

function getSellerOrderStatusClass(status) {
    if (["ready_for_delivery", "assigned", "picked_up", "out_for_delivery"].includes(status)) {
        return "in-progress";
    }
    if (status === "delivered") return "complete";
    if (status === "cancelled") return "cancelled";
    return "waiting";
}

function SellerOrderProgress({ sellerOrders = [] }) {
    if (!sellerOrders.length) return null;

    return (
        <section className="buyer-store-progress" aria-label="Store order progress">
            <h3>Store order progress</h3>
            {sellerOrders.map((sellerOrder) => {
                const seller = sellerOrder.seller;
                const storeName = seller?.seller_profile?.store_name
                    || seller?.sellerProfile?.store_name
                    || seller?.name
                    || `Store ${sellerOrder.seller_id}`;

                return (
                    <div className="buyer-store-progress-row" key={sellerOrder.id}>
                        <span>{storeName}</span>
                        <span className={`buyer-store-status ${getSellerOrderStatusClass(sellerOrder.status)}`}>
                            {getSellerOrderStatusLabel(sellerOrder.status)}
                        </span>
                    </div>
                );
            })}
        </section>
    );
}

/** Submit a review for a product the buyer purchased in this order. */
function ProductReviewForm({ orderId, productId }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");
        setError("");
        if (!rating) {
            setError("Choose a star rating before submitting.");
            return;
        }
        setSubmitting(true);

        try {
            const result = await submitProductReview({
                productId,
                orderId,
                rating: Number(rating),
                comment,
            });

            setMessage(result?.message || "Your review was submitted for approval.");
            setSubmitted(true);
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
            {!submitted && (
                <>
                    <fieldset className="buyer-review-rating">
                        <legend>Your rating</legend>
                        <div className="buyer-review-stars" role="group" aria-label="Choose a rating from 1 to 5 stars">
                            {[1, 2, 3, 4, 5].map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    className="buyer-review-star"
                                    aria-label={`${value} star${value === 1 ? "" : "s"}${value === 5 ? ", Excellent" : ""}`}
                                    aria-pressed={rating === value}
                                    title={value === 5 ? "Excellent" : `${value} star${value === 1 ? "" : "s"}`}
                                    onClick={() => setRating(value)}
                                >
                                    <Star
                                        size={28}
                                        fill={rating >= value ? "currentColor" : "none"}
                                        aria-hidden="true"
                                    />
                                </button>
                            ))}
                        </div>
                        <span className="buyer-review-rating-label">
                            {rating === 0 ? "Select a star rating" : ["", "Poor", "Fair", "Good", "Very good", "Excellent"][rating]}
                        </span>
                    </fieldset>

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

                    <button type="submit" disabled={submitting || rating === 0}>
                        {submitting ? "Submitting…" : "Submit review"}
                    </button>
                </>
            )}

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
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = async (quietRefresh = false) => {
        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "/login";
            return;
        }

        try {
            if (quietRefresh) setRefreshing(true);
            else setLoading(true);
            setError("");

            // Link valid guest checkouts to the buyer account so they can be tracked here.
            const guestOrderKeys = Object.keys(localStorage).filter((key) => key.startsWith("orderme_guest_order_"));
            for (const key of guestOrderKeys) {
                try {
                    const guestOrder = JSON.parse(localStorage.getItem(key) || "null");
                    if (!guestOrder?.order?.id || !guestOrder?.guestAccessToken) continue;
                    const claimResponse = await fetch(`${API_URL}/guest/orders/${guestOrder.order.id}/claim`, {
                        method: "POST",
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ guest_access_token: guestOrder.guestAccessToken }),
                    });
                    if (claimResponse.ok) localStorage.removeItem(key);
                } catch (claimError) {
                    console.warn("Unable to link a recent guest order:", claimError);
                }
            }

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
            if (quietRefresh) setRefreshing(false);
            else setLoading(false);
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

    const isOrderCompleted = (status) =>
        ["delivered", "completed", "complete"].includes(status?.toLowerCase());

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

                    <button
                        type="button"
                        className="buyer-orders-refresh"
                        onClick={() => fetchOrders(true)}
                        disabled={refreshing}
                    >
                        <RefreshCw size={16} className={refreshing ? "spinning" : ""} />
                        {refreshing ? "Updating..." : "Refresh status"}
                    </button>
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

                                        <SellerOrderProgress sellerOrders={order.seller_orders || order.sellerOrders || []} />

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
                                                    {productId != null && isOrderCompleted(order.status) && (
                                                        <ProductReviewForm
                                                            orderId={order.id}
                                                            productId={productId}
                                                        />
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}

                                        {isOrderCompleted(order.status) && (
                                            <GeneralFeedbackForm orderId={order.id} />
                                        )}

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
