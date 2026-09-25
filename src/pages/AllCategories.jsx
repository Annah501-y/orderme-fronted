import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CategoryCard from "../components/CategoryCard";

import "../components_styles/category-card.css";
import "../pages_styles/all-categories.css";

const API_URL = import.meta.env.VITE_API_URL;

function AllCategories() {

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();


    // ================================
    // FETCH CATEGORIES
    // ================================

    useEffect(() => {

        const fetchCategories = async () => {

            try {

                setLoading(true);
                setError("");

                const response = await fetch(
                    `${API_URL}/categories`,
                    {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                        },
                    }
                );

                const result = await response.json();

                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        "Failed to load categories."
                    );

                }

                setCategories(result.data || []);

            } catch (error) {

                console.error(
                    "Categories error:",
                    error
                );

                setError(
                    error.message ||
                    "Unable to load categories."
                );

            } finally {

                setLoading(false);

            }

        };

        fetchCategories();

    }, []);


    // ================================
    // CATEGORY CLICK
    // ================================

    const handleCategoryClick = (categoryId) => {

        navigate(
            `/products?category=${categoryId}`
        );

    };


    // ================================
    // RETRY
    // ================================

    const handleRetry = () => {

        window.location.reload();

    };


    return (

        <div className="categories-page">

            <div className="container">


                {/* ================================
                    PAGE HEADER
                ================================= */}

                <div className="categories-page-header">

                    <span className="categories-page-label">
                        ORDERME SHOP
                    </span>

                    <h1>
                        All Categories
                    </h1>

                    <p>
                        Explore our categories and discover
                        products from trusted sellers on OrderMe.
                    </p>

                </div>


                {/* ================================
                    LOADING
                ================================= */}

                {loading && (

                    <div className="categories-page-state">

                        <div
                            className="spinner-border"
                            role="status"
                        >
                        </div>

                        <p>
                            Loading categories...
                        </p>

                    </div>

                )}


                {/* ================================
                    ERROR
                ================================= */}

                {!loading && error && (

                    <div className="categories-page-state categories-page-error">

                        <p>
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={handleRetry}
                        >
                            Try Again
                        </button>

                    </div>

                )}


                {/* ================================
                    EMPTY
                ================================= */}

                {!loading &&
                    !error &&
                    categories.length === 0 && (

                        <div className="categories-page-state">

                            <p>
                                No categories available.
                            </p>

                        </div>

                    )}


                {/* ================================
                    CATEGORIES
                ================================= */}

                {!loading &&
                    !error &&
                    categories.length > 0 && (

                        <div className="row g-4">

                            {categories.map((category) => (

                                <div
                                    className="col-12 col-sm-6 col-md-4 col-lg-3"
                                    key={category.id}
                                >

                                    <div
                                        className="categories-page-card"
                                        onClick={() =>
                                            handleCategoryClick(
                                                category.id
                                            )
                                        }
                                    >

                                        <CategoryCard
                                            category={category}
                                        />

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

            </div>

        </div>

    );

}

export default AllCategories;