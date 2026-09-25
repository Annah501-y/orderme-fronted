import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CategoryCard from "./CategoryCard";

import "../components_styles/category-card.css";
import "../components_styles/categories.css";


// ================================
// CATEGORIES COMPONENT
// ================================

function Categories() {

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const API_URL = import.meta.env.VITE_API_URL;

    const navigate = useNavigate();


    // ================================
    // FETCH CATEGORIES FROM BACKEND
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

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Failed to load categories."
                    );
                }

                setCategories(data.data || []);

            } catch (error) {

                console.error(
                    "Fetch categories error:",
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

    }, [API_URL]);


    // ================================
    // DUPLICATE CATEGORIES
    // For continuous scrolling
    // ================================

    const sliderCategories = [
        ...categories,
        ...categories,
    ];


    // ================================
    // CATEGORY CLICK
    // ================================

    const handleCategoryClick = (categoryId) => {

        navigate(
            `/products?category=${categoryId}`
        );

    };


    // ================================
    // VIEW ALL CATEGORIES
    // ================================

    const handleViewAllCategories = () => {

        navigate("/allcategories");

    };


    return (

        <section className="categories-section">

            <div className="container">

                {/* ================================
                    HEADER
                ================================= */}

                <div className="categories-header">

                    <div>

                        <span className="categories-label">
                            SHOP BY CATEGORY
                        </span>

                        <h2 className="categories-title">
                            Explore Our Categories
                        </h2>

                        <p className="categories-description">
                            Discover products across a wide range of
                            categories from trusted sellers on OrderMe.
                        </p>

                    </div>


                    {/* VIEW ALL BUTTON */}

                    <button
                        className="categories-view-button"
                        onClick={
                            handleViewAllCategories
                        }
                    >
                        View All Categories
                    </button>

                </div>


                {/* ================================
                    CATEGORY CAROUSEL
                ================================= */}

                <div className="categories-slider">

                    {loading && (
                        <div className="categories-loading">
                            Loading categories...
                        </div>
                    )}


                    {error && !loading && (
                        <div className="categories-error">
                            {error}
                        </div>
                    )}


                    {!loading &&
                        !error &&
                        categories.length === 0 && (
                            <div className="categories-empty">
                                No categories available.
                            </div>
                        )}


                    {!loading &&
                        !error &&
                        categories.length > 0 && (

                            <div className="categories-track">

                                {sliderCategories.map(
                                    (category, index) => (

                                        <div
                                            className="category-slide"
                                            key={`${category.id}-${index}`}
                                            onClick={() =>
                                                handleCategoryClick(
                                                    category.id
                                                )
                                            }
                                            style={{
                                                cursor: "pointer",
                                            }}
                                        >

                                            <CategoryCard
                                                category={category}
                                            />

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                </div>

            </div>

        </section>

    );
}


export default Categories;