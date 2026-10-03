import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

import "../components_styles/product-card.css";
import "../components_styles/featured-products.css";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function FeaturedProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(`${API_URL}/products`, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                    },
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message || "Failed to fetch products."
                    );
                }

                setProducts(result.data || []);
            } catch (error) {
                console.error("Products error:", error);

                setError(
                    error.message || "Unable to load products."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const formatProduct = (product) => {
        return {
            id: product.id,

            name: product.name,

            description: product.description,

            price: Number(product.price),

            stock_quantity: product.stock_quantity,

            category: product.category?.name || "Uncategorized",

            categoryId: product.category?.id || null,

            seller: product.seller?.name || "Unknown Seller",

            sellerId: product.seller?.id || null,

            location: product.seller?.location || "Dar es Salaam",

            image: product.image_url|| null,

            rating: Number(product.rating || 0),

            reviews: Number(product.reviews || 0),

            discount: product.discount || null,

            oldPrice: product.old_price
                ? Number(product.old_price)
                : null,
        };
    };

    return (
        <section className="featured-products-section">

            <div className="container">

                <div className="featured-products-header">

                    <div>
                        

                        <p className="featured-products-description">
                            Browse products offered by sellers on OrderMe.
                        </p>
                    </div>

                    <Link to="/products" className="featured-products-view-button">
                        View All Products
                    </Link>

                </div>

                {loading && (
                    <div className="text-center py-5">
                        Loading products...
                    </div>
                )}

                {error && (
                    <div className="text-center py-5 text-danger">
                        {error}
                    </div>
                )}

                {!loading && !error && products.length === 0 && (
                    <div className="text-center py-5">
                        No products available.
                    </div>
                )}

                {!loading && !error && products.length > 0 && (
                    <div className="row g-4">

                        {products.map((product) => (
                            <div
                                className="col-12 col-sm-6 col-lg-3"
                                key={product.id}
                            >
                                <ProductCard
                                    product={formatProduct(product)}
                                />
                            </div>
                        ))}

                    </div>
                )}

            </div>

        </section>
    );
}

export default FeaturedProducts;
