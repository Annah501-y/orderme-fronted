import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    ArrowRight,
    Check,
} from "lucide-react";

import "../pages_styles/cart.css";

const API_URL = import.meta.env.VITE_API_URL;

function Cart() {
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_URL}/cart`, {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to load cart."
                );
            }

            const items = result.data?.items || [];

            setCartItems(items);

            /*
             * Select all items by default when the cart loads.
             */
            setSelectedItems(items.map((item) => item.id));

        } catch (error) {
            console.error("Cart error:", error);
            setError(error.message || "Unable to load cart.");
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        if (quantity < 1) return;

        try {
            const response = await fetch(
                `${API_URL}/cart/items/${itemId}`,
                {
                    method: "PUT",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        quantity,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to update quantity."
                );
            }

            fetchCart();

        } catch (error) {
            console.error("Update quantity error:", error);
            setError(error.message);
        }
    };

    const removeItem = async (itemId) => {
        try {
            const response = await fetch(
                `${API_URL}/cart/items/${itemId}`,
                {
                    method: "DELETE",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to remove item."
                );
            }

            setSelectedItems((previous) =>
                previous.filter((id) => id !== itemId)
            );

            fetchCart();

        } catch (error) {
            console.error("Remove item error:", error);
            setError(error.message);
        }
    };

    const clearCart = async () => {
        try {
            const response = await fetch(`${API_URL}/cart`, {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to clear cart."
                );
            }

            setCartItems([]);
            setSelectedItems([]);

        } catch (error) {
            console.error("Clear cart error:", error);
            setError(error.message);
        }
    };

    /*
     * Select or unselect one cart item.
     */
    const toggleItem = (itemId) => {
        setSelectedItems((previous) => {
            if (previous.includes(itemId)) {
                return previous.filter(
                    (id) => id !== itemId
                );
            }

            return [...previous, itemId];
        });
    };

    /*
     * Select or unselect every cart item.
     */
    const toggleSelectAll = () => {
        if (
            selectedItems.length === cartItems.length
        ) {
            setSelectedItems([]);
        } else {
            setSelectedItems(
                cartItems.map((item) => item.id)
            );
        }
    };

    const checkoutAll = () => {
        if (cartItems.length === 0) return;

        navigate("/checkout", {
            state: {
                cartItemIds: cartItems.map((item) => item.id),
            },
        });
    };

    const formatPrice = (price) =>
        `TSh ${Number(price || 0).toLocaleString()}`;

    /*
     * Total for ALL cart items.
     */
    const total = cartItems.reduce((sum, item) => {
        const price = Number(
            item.product?.price || 0
        );

        const quantity = Number(
            item.quantity || 0
        );

        return sum + price * quantity;
    }, 0);

    /*
     * Total for SELECTED items only.
     */
    const selectedTotal = cartItems
        .filter((item) =>
            selectedItems.includes(item.id)
        )
        .reduce((sum, item) => {
            const price = Number(
                item.product?.price || 0
            );

            const quantity = Number(
                item.quantity || 0
            );

            return sum + price * quantity;
        }, 0);

    const totalItems = cartItems.reduce(
        (sum, item) =>
            sum + Number(item.quantity || 0),
        0
    );

    const selectedTotalItems = cartItems
        .filter((item) =>
            selectedItems.includes(item.id)
        )
        .reduce(
            (sum, item) =>
                sum + Number(item.quantity || 0),
            0
        );

    const allSelected =
        cartItems.length > 0 &&
        selectedItems.length === cartItems.length;

    if (loading) {
        return (
            <div className="cart-page">
                <div className="container">
                    <div className="cart-state">
                        <div className="spinner-border"></div>
                        <p>Loading your cart...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="container">

                <div className="cart-header">

                    <div>
                        <Link to="/products" className="cart-label cart-shop-link">
                            Shop Products
                        </Link>

                        <h1>Your Cart</h1>

                        <p>
                            Review the products you want to purchase.
                        </p>
                    </div>

                    {cartItems.length > 0 && (
                        <button
                            className="clear-cart-button"
                            onClick={clearCart}
                        >
                            <Trash2 size={16} />
                            Clear Cart
                        </button>
                    )}

                </div>

                {error && (
                    <div className="cart-error">
                        {error}
                    </div>
                )}

                {cartItems.length === 0 ? (
                    <div className="cart-empty">

                        <ShoppingCart size={48} />

                        <h3>Your cart is empty</h3>

                        <p>
                            Browse our products and add something
                            to your cart.
                        </p>

                        <Link
                            to="/products"
                            className="shop-products-button"
                        >
                            Shop Products
                            <ArrowRight size={17} />
                        </Link>

                    </div>
                ) : (
                    <div className="cart-layout">

                        <div className="cart-items">

                            <div className="cart-select-all">

                                <label>
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={toggleSelectAll}
                                    />

                                    <span>
                                        Select All
                                    </span>
                                </label>

                                <span>
                                    {selectedItems.length} of{" "}
                                    {cartItems.length} selected
                                </span>

                            </div>

                            {cartItems.map((item) => {

                                const product = item.product;

                                const quantity = Number(
                                    item.quantity || 1
                                );

                                const isSelected =
                                    selectedItems.includes(
                                        item.id
                                    );

                                return (
                                    <div
                                        className={`cart-item ${isSelected
                                                ? "cart-item-selected"
                                                : ""
                                            }`}
                                        key={item.id}
                                    >

                                        <div className="cart-item-select">

                                            <button
                                                type="button"
                                                className={`cart-checkbox ${isSelected
                                                        ? "checked"
                                                        : ""
                                                    }`}
                                                onClick={() =>
                                                    toggleItem(
                                                        item.id
                                                    )
                                                }
                                                aria-label={
                                                    isSelected
                                                        ? "Unselect product"
                                                        : "Select product"
                                                }
                                            >
                                                {isSelected && (
                                                    <Check
                                                        size={14}
                                                    />
                                                )}
                                            </button>

                                        </div>

                                        <Link to={`/products/${product?.id}`} className="cart-item-product-link" aria-label={`View ${product?.name || "product"}`}>
                                            <div className="cart-item-image">

                                                {product?.image_url ? (
                                                    <img
                                                        src={
                                                            product.image_url
                                                        }
                                                        alt={
                                                            product.name
                                                        }
                                                    />
                                                ) : (
                                                    <ShoppingCart
                                                        size={30}
                                                    />
                                                )}

                                            </div>
                                        </Link>

                                        <div className="cart-item-details">

                                            <h3>
                                                <Link to={`/products/${product?.id}`} className="cart-item-name-link">
                                                    {product?.name}
                                                </Link>
                                            </h3>

                                            <span>
                                                {product
                                                    ?.category
                                                    ?.name ||
                                                    "Uncategorized"}
                                            </span>

                                            <strong>
                                                {formatPrice(
                                                    product?.price
                                                )}
                                            </strong>

                                        </div>

                                        <div className="cart-item-actions">

                                            <div className="quantity-control">

                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            quantity - 1
                                                        )
                                                    }
                                                    disabled={
                                                        quantity <=
                                                        1
                                                    }
                                                >
                                                    <Minus size={15} />
                                                </button>

                                                <span>
                                                    {quantity}
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            quantity + 1
                                                        )
                                                    }
                                                >
                                                    <Plus size={15} />
                                                </button>

                                            </div>

                                            <strong className="cart-item-total">
                                                {formatPrice(
                                                    Number(
                                                        product?.price ||
                                                        0
                                                    ) *
                                                    quantity
                                                )}
                                            </strong>

                                            <button
                                                className="remove-item-button"
                                                onClick={() =>
                                                    removeItem(
                                                        item.id
                                                    )
                                                }
                                                title="Remove item"
                                            >
                                                <Trash2
                                                    size={17}
                                                />
                                            </button>

                                        </div>

                                    </div>
                                );
                            })}

                        </div>

                        <div className="cart-summary">

                            <h2>Order Summary</h2>

                            <div className="summary-row">
                                <span>Cart Items</span>
                                <span>
                                    {totalItems}
                                </span>
                            </div>

                            <div className="summary-row">
                                <span>Selected Items</span>
                                <span>
                                    {selectedTotalItems}
                                </span>
                            </div>

                            <div className="summary-row">
                                <span>Subtotal</span>

                                <strong>
                                    {formatPrice(
                                        selectedTotal
                                    )}
                                </strong>
                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-total">

                                <span>
                                    Checkout Total
                                </span>

                                <strong>
                                    {formatPrice(
                                        selectedTotal
                                    )}
                                </strong>

                            </div>

                            {selectedItems.length > 0 ? (
                                <Link
                                    to="/checkout"
                                    state={{ cartItemIds: selectedItems }}
                                    className="checkout-all-button"
                                >
                                    Proceed to Checkout
                                    <ArrowRight size={17} />
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    className="checkout-button"
                                    disabled
                                >
                                    Select items to checkout
                                </button>
                            )}

                            <button
                                type="button"
                                className="checkout-all-button"
                                onClick={checkoutAll}
                            >
                                Checkout All
                            </button>
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
}

export default Cart;
