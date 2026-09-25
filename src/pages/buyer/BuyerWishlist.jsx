import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Trash2, ShoppingCart, ArrowLeft, ArrowRight } from "lucide-react";
import { fetchAllProducts } from "../../api/marketplace";
import "../../pages_styles/buyer_styles/buyer-wishlist.css";

const API_URL = import.meta.env.VITE_API_URL;
const money = (price) => `TZS ${Number(price || 0).toLocaleString("en-TZ")}`;
const categoryId = (product) => product?.category_id ?? product?.category?.id;
const sellerId = (product) => product?.seller_id ?? product?.seller?.id;

function BuyerWishlist() {
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState(null);
    const [checkoutId, setCheckoutId] = useState(null);
    const [error, setError] = useState("");
    const token = localStorage.getItem("token");

    useEffect(() => {
        (async () => {
            try {
                const [wishlistResponse, products] = await Promise.all([
                    fetch(`${API_URL}/wishlist`, { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } }),
                    fetchAllProducts(),
                ]);
                const result = await wishlistResponse.json();
                if (!wishlistResponse.ok || !result.success) throw new Error(result.message || "Failed to load wishlist.");
                const saved = result.data || [];
                setWishlist(saved);
                const savedProducts = saved.map((item) => item.product).filter(Boolean);
                setRecommendations(savedProducts.map((savedProduct) => ({
                    productId: savedProduct.id,
                    products: products.filter((product) => product.id !== savedProduct.id
                        && categoryId(savedProduct) != null
                        && categoryId(product) === categoryId(savedProduct)
                        && sellerId(product) != null
                        && sellerId(product) !== sellerId(savedProduct)).slice(0, 4),
                })));
            } catch (err) {
                setError(err.message || "Unable to load wishlist.");
            } finally { setLoading(false); }
        })();
    }, []);

    const removeFromWishlist = async (productId) => {
        try {
            setRemovingId(productId);
            const response = await fetch(`${API_URL}/wishlist/${productId}`, { method: "DELETE", headers: { Accept: "application/json", Authorization: `Bearer ${token}` } });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || "Failed to remove product.");
            setWishlist((items) => items.filter((item) => item.product_id !== productId));
            setRecommendations((items) => items.filter((item) => item.productId !== productId));
        } catch (err) { setError(err.message || "Unable to remove product from wishlist."); }
        finally { setRemovingId(null); }
    };

    const checkoutProduct = async (product) => {
        try {
            setCheckoutId(product.id);
            setError("");
            const addResponse = await fetch(`${API_URL}/cart/items`, {
                method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ product_id: product.id, quantity: 1 }),
            });
            const addResult = await addResponse.json();
            if (!addResponse.ok) throw new Error(addResult.message || "Unable to add this product to your cart.");
            const cartResponse = await fetch(`${API_URL}/cart`, { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } });
            const cartResult = await cartResponse.json();
            if (!cartResponse.ok) throw new Error(cartResult.message || "Unable to prepare checkout.");
            const cartItem = (cartResult.data?.items || []).find((item) => Number(item.product_id ?? item.product?.id) === Number(product.id));
            if (!cartItem) throw new Error("This product was added, but could not be found in your cart.");
            navigate("/checkout", { state: { cartItemIds: [cartItem.id] } });
        } catch (err) { setError(err.message || "Unable to start checkout."); }
        finally { setCheckoutId(null); }
    };

    if (loading) return <div className="buyer-wishlist-page"><div className="wishlist-loading"><div className="spinner-border" role="status" /><p>Loading your wishlist...</p></div></div>;

    return <div className="buyer-wishlist-page">
        <div className="wishlist-header">
            <div><Link to="/products" className="wishlist-back-button"><ArrowLeft size={16} /> Back to shopping</Link><p className="wishlist-label">YOUR COLLECTION</p><h1>Wishlist</h1><p>Saved products from OrderMe sellers.</p></div>
            <div className="wishlist-count"><Heart size={18} /><span>{wishlist.length}</span></div>
        </div>
        {error && <div className="wishlist-error" role="alert">{error}</div>}
        {!error && wishlist.length === 0 && <div className="wishlist-empty"><div className="wishlist-empty-icon"><Heart size={32} /></div><h2>Your wishlist is empty</h2><p>Save products from OrderMe sellers and they will appear here.</p><Link to="/products" className="wishlist-shop-button"><ShoppingCart size={17} /> Browse Products</Link></div>}
        {wishlist.map((item) => {
            const product = item.product;
            if (!product) return null;
            const related = recommendations.find((entry) => entry.productId === product.id)?.products || [];
            return <section className="wishlist-collection" key={item.id}>
                <div className="wishlist-card">
                    <Link to={`/products/${product.id}`} className="wishlist-image-container">{product.image ? <img src={product.image} alt={product.name} /> : <div className="wishlist-image-placeholder"><ShoppingCart size={30} /></div>}</Link>
                    <div className="wishlist-card-content">
                        <Link to={`/products/${product.id}`} className="wishlist-product-name">{product.name}</Link>
                        <p className="wishlist-product-description">{product.description}</p>
                        <div className="wishlist-seller">Sold by {product.seller?.store_name || product.seller?.name || "OrderMe seller"}</div>
                        <div className="wishlist-card-bottom"><strong>{money(product.price)}</strong><div className="wishlist-card-actions">
                            <button type="button" className="wishlist-remove-button" onClick={() => removeFromWishlist(product.id)} disabled={removingId === product.id} title="Remove from wishlist" aria-label="Remove from wishlist">{removingId === product.id ? "…" : <Trash2 size={17} />}</button>
                            <button type="button" className="wishlist-checkout-button" onClick={() => checkoutProduct(product)} disabled={checkoutId === product.id}>{checkoutId === product.id ? "Preparing…" : "Checkout"}<ArrowRight size={16} /></button>
                        </div></div>
                    </div>
                </div>
                {related.length > 0 && <div className="wishlist-related"><div className="wishlist-related-heading"><h2>More like this</h2><span>Other OrderMe sellers</span></div><div className="wishlist-related-grid">{related.map((suggestion) => <article className="wishlist-related-card" key={suggestion.id}><Link to={`/products/${suggestion.id}`} className="wishlist-related-image">{suggestion.image ? <img src={suggestion.image} alt={suggestion.name} /> : <ShoppingCart size={24} />}</Link><div><Link to={`/products/${suggestion.id}`} className="wishlist-related-name">{suggestion.name}</Link><span className="wishlist-related-seller">{suggestion.seller?.store_name || suggestion.seller?.name || "OrderMe seller"}</span><strong>{money(suggestion.price)}</strong></div></article>)}</div></div>}
            </section>;
        })}
    </div>;
}

export default BuyerWishlist;
