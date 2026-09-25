import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, MapPin, Star, ShoppingCart } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

function ProductCard({ product, onAddToCart }) {
    const navigate = useNavigate();
    const [adding, setAdding] = useState(false);
    const [favorited, setFavorited] = useState(false);
    const [favoriteError, setFavoriteError] = useState("");
    const [cartError, setCartError] = useState("");
    const toggleFavorite = async () => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        setFavoriteError("");
        try {
            if (favorited) {
                const response = await fetch(`${API_URL}/wishlist/${product.id}`, {
                    method: "DELETE", headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error("Could not remove this favorite.");
                setFavorited(false);
            } else {
                const response = await fetch(`${API_URL}/wishlist/${product.id}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ product_id: product.id }),
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || "Could not save this favorite.");
                setFavorited(true);
            }
        } catch (error) { setFavoriteError(error.message); }
    };
    const addAndCheckout = async () => {
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
                if (!cartResponse.ok) throw new Error(cartResult.message || "Unable to prepare checkout.");
                const cartItem = (cartResult.data?.items || []).find((item) => Number(item.product_id ?? item.product?.id) === Number(product.id));
                cartItemIds = cartItem ? [cartItem.id] : [];
            }
            if (Array.isArray(cartItemIds) && cartItemIds.length) {
                navigate("/checkout", { state: { cartItemIds } });
            } else {
                setCartError("Product added, but checkout could not be opened.");
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

                <span className="product-category">
                    {product.category}
                </span>

                <h3 className="product-name"><Link to={`/products/${product.id}`}>{product.name}</Link></h3>

                <div className="product-rating">
                    <Star size={15} fill="currentColor" />
                    <span>{product.rating}</span>
                    <span className="product-reviews">
                        ({product.reviews})
                    </span>
                </div>

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

                <div className="product-seller">
                    <span>{product.seller}</span>

                    <div className="product-location">
                        <MapPin size={14} />
                        {product.location}
                    </div>
                </div>

                <button
                    type="button"
                    className="product-cart-button"
                    onClick={addAndCheckout}
                    disabled={adding}
                >
                    <ShoppingCart size={17} />
                    {adding ? "Adding…" : "Add to Cart"}
                </button>
                {cartError && <p className="product-card-feedback" role="alert">{cartError}</p>}

            </div>

        </div>
    );
}

export default ProductCard;
