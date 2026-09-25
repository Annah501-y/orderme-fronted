import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { fetchAllProducts } from "../api/marketplace";

import "../components_styles/product-card.css";
import "../pages_styles/products.css";

const API_URL = import.meta.env.VITE_API_URL;

function Products() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [notification, setNotification] = useState({
        message: "",
        type: "",
    });

    // ================================
    // READ CATEGORY FROM URL
    // ================================

    const [searchParams] = useSearchParams();

    const categoryId = searchParams.get("category");
    const searchTerm = (searchParams.get("search") || "").trim().toLowerCase();
    const sellerId = searchParams.get("seller");


    // ================================
    // FETCH PRODUCTS
    // ================================

    useEffect(() => {

        let isCurrent = true;

        // Search and seller filters run over the complete paginated API catalog.
        fetchAllProducts()
            .then((result) => {
                if (isCurrent) {
                    setProducts(result);
                }
            })
            .catch((loadError) => {
                if (isCurrent) {
                    console.error("Products error:", loadError);
                    setError(loadError.message || "Unable to load products.");
                }
            })
            .finally(() => {
                if (isCurrent) {
                    setLoading(false);
                }
            });

        return () => {
            isCurrent = false;
        };
    }, []);

    const visibleProducts = useMemo(() => products.filter((product) => {
        const seller = product.seller;
        const matchesCategory = !categoryId || String(product.category?.id) === categoryId;
        const matchesSeller = !sellerId || String(seller?.id) === sellerId;
        const searchableText = [
            product.name,
            product.description,
            seller?.name,
            seller?.store_name,
            seller?.seller_profile?.store_name,
            product.category?.name,
        ].filter(Boolean).join(" ").toLowerCase();
        const matchesSearch = !searchTerm || searchableText.includes(searchTerm);

        return matchesCategory && matchesSeller && matchesSearch;
    }), [products, categoryId, searchTerm, sellerId]);


    // ================================
    // FORMAT PRODUCT
    // ================================

    const formatProduct = (product) => {

        return {

            id: product.id,

            name: product.name,

            description: product.description,

            price: Number(product.price),

            stock_quantity:
                product.stock_quantity,


            category:
                product.category?.name ||
                "Uncategorized",

            categoryId:
                product.category?.id ||
                null,


            seller:
                product.seller?.name ||
                "Unknown Seller",

            sellerId:
                product.seller?.id ||
                null,


            location:
                product.seller?.location ||
                "Dar es Salaam",


            image:
                product.image_url ||
                null,


            rating:
                Number(product.rating || 0),

            reviews:
                Number(product.reviews || 0),


            discount:
                product.discount ||
                null,


            oldPrice:
                product.old_price
                    ? Number(product.old_price)
                    : null,

        };

    };


    // ================================
    // ADD TO CART
    // ================================

    const addToCart = async (productId) => {

        const token =
            localStorage.getItem("token");


        if (!token) {

            window.location.href = "/login";

            return [];

        }


        try {

            const response = await fetch(
                `${API_URL}/cart/items`,
                {
                    method: "POST",

                    headers: {
                        Accept: "application/json",
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        product_id: productId,
                        quantity: 1,
                    }),
                }
            );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "Failed to add product to cart."
                );

            }

            const cartResponse = await fetch(`${API_URL}/cart`, {
                headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
            });
            const cartResult = await cartResponse.json();
            if (!cartResponse.ok) throw new Error(cartResult.message || "Added to cart, but checkout could not be opened.");
            const cartItemIds = (cartResult.data?.items || []).map((item) => item.id);


            setNotification({
                message:
                    result.message ||
                    "Product added to cart.",

                type: "success",
            });


            setTimeout(() => {

                setNotification({
                    message: "",
                    type: "",
                });

            }, 3000);

            return cartItemIds;


        } catch (error) {

            console.error(
                "Add to cart error:",
                error
            );


            setNotification({

                message:
                    error.message ||
                    "Unable to add product to cart.",

                type: "error",

            });


            setTimeout(() => {

                setNotification({
                    message: "",
                    type: "",
                });

            }, 3000);

            return [];

        }

    };


    return (

        <div className="products-page">


            {/* ================================
                NOTIFICATION
            ================================= */}

            {notification.message && (

                <div
                    className={`products-notification ${notification.type}`}
                >

                    <span>
                        {notification.message}
                    </span>


                    <button
                        type="button"
                        onClick={() =>
                            setNotification({
                                message: "",
                                type: "",
                            })
                        }
                        aria-label="Close notification"
                    >
                        ×
                    </button>

                </div>

            )}


            <div className="container">


                {/* ================================
                    PAGE HEADER
                ================================= */}

                <div className="products-page-header">

                    <div>

                        <span className="products-page-label">
                            ORDERME SHOP
                        </span>


                        <h1>

                            {categoryId
                                ? "Category Products"
                                : "All Products"}

                        </h1>


                        <p>

                            {categoryId
                                ? "Browse products available in this category from trusted sellers on OrderMe."
                                : "Browse products from trusted sellers on OrderMe."}

                        </p>

                    </div>


                    <span className="products-count">
                        {visibleProducts.length} products

                    </span>

                </div>


                {/* ================================
                    LOADING
                ================================= */}

                {loading && (

                    <div className="products-state">

                        <div
                            className="spinner-border"
                            role="status"
                        ></div>


                        <p>
                            Loading products...
                        </p>

                    </div>

                )}


                {/* ================================
                    ERROR
                ================================= */}

                {!loading && error && (

                    <div
                        className="products-state products-error"
                    >

                        <p>
                            {error}
                        </p>


                        <button
                            type="button"
                            onClick={() =>
                                window.location.reload()
                            }
                        >
                            Try Again
                        </button>

                    </div>

                )}


                {/* ================================
                    NO PRODUCTS
                ================================= */}

                {!loading &&
                    !error &&
                    visibleProducts.length === 0 && (

                        <div className="products-state">

                            <p>
                                {searchTerm || sellerId
                                    ? "No products matched your search."
                                    : categoryId
                                    ? "No products found in this category."
                                    : "No products available."}
                            </p>

                        </div>

                    )}


                {/* ================================
                    PRODUCTS
                ================================= */}

                {!loading &&
                    !error &&
                    visibleProducts.length > 0 && (

                        <div className="row g-4">

                            {visibleProducts.map((product) => (

                                <div
                                    className="col-12 col-sm-6 col-lg-4 col-xl-3"
                                    key={product.id}
                                >

                                    <ProductCard
                                        product={
                                            formatProduct(
                                                product
                                            )
                                        }

                                        onAddToCart={
                                            addToCart
                                        }

                                    />

                                </div>

                            ))}

                        </div>

                    )}

            </div>

        </div>

    );

}

export default Products;
