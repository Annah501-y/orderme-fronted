import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    ShoppingCart,
    Minus,
    Plus,
    Store,
} from "lucide-react";
import ProductCard from "./ProductCard";
import { fetchAllProducts } from "../api/marketplace";

import "../components_styles/prouct-details.css";
import "../components_styles/product-card.css";

const API_URL =
    import.meta.env.VITE_API_URL;

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [catalogProducts, setCatalogProducts] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);
    const [cartMessage, setCartMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${API_URL}/products/${id}`
                );

                if (!response.ok) {
                    throw new Error("Product not found.");
                }

                const result = await response.json();

                setProduct(result.data);
            } catch (error) {
                console.error("Product details error:", error);
                setError("Unable to load product.");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
        fetchAllProducts().then(setCatalogProducts).catch(() => setCatalogProducts([]));
    }, [id]);

    const increaseQuantity = () => {
        if (
            product &&
            quantity < Number(product.stock_quantity)
        ) {
            setQuantity((previous) => previous + 1);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity((previous) => previous - 1);
        }
    };

    const handleAddToCart = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        try {
            setAddingToCart(true);
            setCartMessage("");
            setError("");

            const response = await fetch(
                `${API_URL}/cart/items`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        product_id: product.id,
                        quantity: quantity,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Unable to add product to cart."
                );
            }

            setCartMessage(
                result.message || "Product added to cart."
            );

            const cartResponse = await fetch(`${API_URL}/cart`, {
                headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
            });
            const cartResult = await cartResponse.json();
            if (!cartResponse.ok) throw new Error(cartResult.message || "Added to cart, but checkout could not be opened.");
            const cartItemIds = (cartResult.data?.items || []).map((item) => item.id);
            if (cartItemIds.length) navigate("/checkout", { state: { cartItemIds } });

        } catch (error) {
            console.error("Add to cart error:", error);

            setError(
                error.message ||
                "Unable to add product to cart."
            );
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) {
        return (
            <div className="product-details-loading">
                Loading product...
            </div>
        );
    }

    if (error && !product) {
        return (
            <div className="product-details-error">
                {error}
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-details-error">
                Product not found.
            </div>
        );
    }

    const stock = Number(product.stock_quantity || 0);
    const discount = Number(product.discount || 0);

    const image =
        product.image_url ||
        product.image ||
        "/images/product-placeholder.png";
    const relatedProducts = catalogProducts.filter((candidate) =>
        String(candidate.id) !== String(product.id)
        && product.category?.id != null
        && String(candidate.category?.id) === String(product.category.id)
        && candidate.seller?.id != null
        && String(candidate.seller.id) !== String(product.seller?.id)
    ).slice(0, 8);

    return (
        <div className="product-details-page">

            <div className="product-details-container">

                <button
                    type="button"
                    className="product-back-link"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={18} />
                    Back
                </button>

                <div className="product-details-card">

                    <div className="product-details-image-wrapper">
                        <img
                            src={image}
                            alt={product.name}
                            className="product-details-image"
                        />
                    </div>

                    <div className="product-details-info">

                        {product.category?.name && (
                            <span className="product-details-category">
                                {product.category.name}
                            </span>
                        )}

                        <h1 className="product-details-title">
                            {product.name}
                        </h1>

                        <p className="product-details-description">
                            {product.description ||
                                "No description available for this product."}
                        </p>

                        <div className="product-details-pricing">

                            {product.old_price && (
                                <span className="product-details-old-price">
                                    TSh{" "}
                                    {Number(
                                        product.old_price
                                    ).toLocaleString()}
                                </span>
                            )}

                            <span className="product-details-price">
                                TSh{" "}
                                {Number(
                                    product.price
                                ).toLocaleString()}
                            </span>

                            {discount > 0 && (
                                <span className="product-details-discount">
                                    {discount}% OFF
                                </span>
                            )}

                        </div>

                        <div className="product-details-seller">

                            <Store size={18} />

                            <span>
                                Sold by{" "}
                                <strong>
                                    {product.seller?.store_name ||
                                        product.seller?.name ||
                                        "OrderMe Seller"}
                                </strong>
                            </span>

                        </div>

                        <div className="product-details-stock">

                            {stock > 0 ? (
                                <span className="product-stock-available">
                                    {stock} items available
                                </span>
                            ) : (
                                <span className="product-stock-low">
                                    Out of stock
                                </span>
                            )}

                        </div>

                        {stock > 0 && (
                            <div className="product-quantity-section">

                                <div className="product-quantity-label">
                                    Quantity
                                </div>

                                <div className="product-quantity-control">

                                    <button
                                        type="button"
                                        onClick={decreaseQuantity}
                                        disabled={
                                            quantity <= 1 ||
                                            addingToCart
                                        }
                                    >
                                        <Minus size={17} />
                                    </button>

                                    <span>
                                        {quantity}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={increaseQuantity}
                                        disabled={
                                            quantity >= stock ||
                                            addingToCart
                                        }
                                    >
                                        <Plus size={17} />
                                    </button>

                                </div>

                            </div>
                        )}

                        {cartMessage && (
                            <div className="alert alert-success mt-3">
                                {cartMessage}
                            </div>
                        )}

                        {error && product && (
                            <div className="alert alert-danger mt-3">
                                {error}
                            </div>
                        )}

                        <button
                            type="button"
                            className="product-add-cart-button"
                            onClick={handleAddToCart}
                            disabled={
                                stock <= 0 ||
                                addingToCart
                            }
                        >
                            <ShoppingCart size={19} />

                            {addingToCart
                                ? "Adding..."
                                : stock > 0
                                ? "Add to Cart"
                                : "Out of Stock"}
                        </button>

                    </div>

                </div>

            </div>

            {relatedProducts.length > 0 && <section className="product-related-section">
                <div className="product-related-heading"><span>MORE TO EXPLORE</span><h2>Similar products from other sellers</h2></div>
                <div className="row g-4">{relatedProducts.map((related) => <div className="col-12 col-sm-6 col-lg-3" key={related.id}><ProductCard product={{
                    id: related.id, name: related.name, description: related.description, price: Number(related.price || 0), stock_quantity: related.stock_quantity,
                    category: related.category?.name || "Product", seller: related.seller?.store_name || related.seller?.name || "OrderMe seller",
                    location: related.seller?.location || "Tanzania", image: related.image_url || related.image || null,
                    rating: Number(related.rating || 0), reviews: Number(related.reviews || 0), discount: related.discount || null,
                    oldPrice: related.old_price ? Number(related.old_price) : null,
                }} /></div>)}</div>
            </section>}
        </div>
    );
}

export default ProductDetails;
