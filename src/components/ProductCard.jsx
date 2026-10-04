import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, MapPin, Star, ShoppingCart } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
// Guest favorites stay on this device until the customer signs in.
const GUEST_FAVORITES_KEY = "orderme_guest_favorites";

// Ignore malformed browser storage so a damaged value cannot break the product grid.
function readGuestFavorites() {
    try {
        const saved = JSON.parse(localStorage.getItem(GUEST_FAVORITES_KEY) || "[]");
        return Array.isArray(saved) ? saved.map(Number) : [];
    } catch {
        return [];
    }
}

function ProductCard({ product, onAddToCart }) {
    const navigate = useNavigate();
    const [adding, setAdding] = useState(false);
    const [favorited, setFavorited] = useState(() =>
        !localStorage.getItem("token") && readGuestFavorites().includes(Number(product.id))
    );
    const [favoriteError, setFavoriteError] = useState("");
    const [cartError, setCartError] = useState("");

    const toggleFavorite = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            // Keep guest favorites available without creating an account, then open the wishlist.
            const favorites = readGuestFavorites();
            const nextFavorites = favorites.includes(Number(product.id))
                ? favorites.filter((id) => id !== Number(product.id))
                : [...favorites, Number(product.id)];

            localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(nextFavorites));
            setFavorited(nextFavorites.includes(Number(product.id)));
            setFavoriteError("");
            navigate("/buyer/wishlist");
            return;
        }

        setFavoriteError("");

        try {
            if (favorited) {
                // Remove from wishlist
                const response = await fetch(
                    `${API_URL}/wishlist/${product.id}`,
                    {
                        method: "DELETE",
                        headers: {
                            Accept: "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Could not remove this favorite.");
                }

                setFavorited(false);
            } else {
                // Add to wishlist
                const response = await fetch(
                    `${API_URL}/wishlist/${product.id}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            product_id: product.id,
                        }),
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message || "Could not save this favorite."
                    );
                }

                setFavorited(true);

                // Go directly to the buyer wishlist
                navigate("/buyer/wishlist");
            }
        } catch (error) {
            setFavoriteError(error.message);
        }
    };
    const addToCart = async () => {
        if (adding) return;
        setAdding(true);
        setCartError("");
        try {
            let cartItemIds;
            if (onAddToCart) {
                cartItemIds = await onAddToCart(product.id);
            } else {
                const token = localStorage.getItem("token");
                if (!token) { navigate("/login"); return; }
                const headers = { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` };
                const addResponse = await fetch(`${API_URL}/cart/items`, { method: "POST", headers, body: JSON.stringify({ product_id: product.id, quantity: 1 }) });
                const addResult = await addResponse.json();
                if (!addResponse.ok) throw new Error(addResult.message || "Unable to add this product to your cart.");
                const cartResponse = await fetch(`${API_URL}/cart`, { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } });
                const cartResult = await cartResponse.json();
                if (!cartResponse.ok) throw new Error(cartResult.message || "Unable to load your cart.");
                const cartItem = (cartResult.data?.items || []).find((item) => Number(item.product_id ?? item.product?.id) === Number(product.id));
                cartItemIds = cartItem ? [cartItem.id] : [];
            }
            if (Array.isArray(cartItemIds) && cartItemIds.length) {
                navigate("/cart");
            } else {
                setCartError("Product added, but your cart could not be opened.");
            }
        } catch (error) {
            setCartError(error.message || "Unable to add this product to your cart.");
        } finally {
            setAdding(false);
        }
    };
    return (
        <div className="product-card">

            <div className="product-image-wrapper">

                {product.discount && (
                    <span className="product-discount">
                        -{product.discount}%
                    </span>
                )}

                <button type="button" className={`product-wishlist ${favorited ? "favorited" : ""}`} onClick={toggleFavorite} aria-label={favorited ? "Remove from favorites" : "Add to favorites"} title={favoriteError || (favorited ? "Saved to favorites" : "Add to favorites")}>
                    <Heart size={18} fill={favorited ? "currentColor" : "none"} />
                </button>

                <Link to={`/products/${product.id}`} className="product-image-link" aria-label={`View ${product.name}`}>
                    <img src={product.image || "/images/product-placeholder.png"} alt={product.name} className="product-image" />
                </Link>

            </div>

            <div className="product-content">

                <h3 className="product-name"><Link to={`/products/${product.id}`}>{product.name}</Link></h3>

                <div className="product-price">
                    <strong>
                        TSh {product.price.toLocaleString()}
                    </strong>

                    {product.oldPrice && (
                        <span>
                            TSh {product.oldPrice.toLocaleString()}
                        </span>
                    )}
                </div>

            </div>

        </div>
    );
}

export default ProductCard;
