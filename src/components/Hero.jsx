import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    ArrowRight,
    Store,
    Truck,
    Percent,
    ShoppingBag,
    Users,
    Package,
    Layers3,
} from "lucide-react";

import hero1 from "../assets/images/hero-1.jpg";
import hero2 from "../assets/images/hero-2.jpg";
import hero3 from "../assets/images/hero-3.jpg";
import hero4 from "../assets/images/hero-4.jpg";
import heroBackground from "../assets/images/hero-background.jpg";
import { fetchAllProducts, fetchDeals } from "../api/marketplace";

import "../components_styles/hero.css";

function Hero() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [catalog, setCatalog] = useState(null);
    const [featuredDeal, setFeaturedDeal] = useState(null);

    useEffect(() => {
        let isCurrent = true;

        // Load marketplace figures and a real promotion from the public Laravel endpoints.
        Promise.allSettled([fetchAllProducts(), fetchDeals()]).then(([productResult, dealResult]) => {
            if (!isCurrent) {
                return;
            }

            if (productResult.status === "fulfilled") {
                const products = productResult.value;
                setCatalog({
                    products: products.length,
                    sellers: new Set(products.map((product) => product.seller?.id).filter(Boolean)).size,
                    categories: new Set(products.map((product) => product.category?.id).filter(Boolean)).size,
                });
            }

            if (dealResult.status === "fulfilled" && dealResult.value.length > 0) {
                setFeaturedDeal(dealResult.value[0]);
            }
        });

        return () => {
            isCurrent = false;
        };
    }, []);

    // Keep search terms in the route so the product list can show matching API data.
    const handleSearch = (event) => {
        event.preventDefault();
        const query = searchTerm.trim();
        navigate(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
    };

    const formattedCount = (value) => value == null ? "—" : value.toLocaleString();

    return (
        <section
            className="hero-section position-relative overflow-hidden"
            style={{ backgroundImage: `url(${heroBackground})` }}
        >
            {/* Keep the hero copy legible over its decorative background image. */}
            <div className="hero-overlay position-absolute top-0 start-0 w-100 h-100"></div>
            <div className="hero-blob"></div>

            <div className="container position-relative py-5">
                <div className="row align-items-center g-5">
                    <div className="col-lg-6 order-2 order-lg-1">
                        <div className="hero-image-collage">
                            <div className="hero-img-box hero-img-main"><img src={hero1} alt="Products available on OrderMe" className="hero-img" /></div>
                            <div className="hero-img-box hero-img-top"><img src={hero2} alt="Browse products from OrderMe sellers" className="hero-img" /></div>
                            <div className="hero-img-box hero-img-bottom"><img src={hero3} alt="Shop local stores on OrderMe" className="hero-img" /></div>
                            <div className="hero-img-box hero-img-float"><img src={hero4} alt="OrderMe marketplace selection" className="hero-img" /></div>

                            {featuredDeal && (
                                <div className="hero-badge hero-badge-deal">
                                    <span className="hero-badge-icon"><Percent size={18} /></span>
                                    <div>
                                        <strong>{featuredDeal.discount}% off</strong>
                                        <span>{featuredDeal.name}</span>
                                    </div>
                                </div>
                            )}

                            <div className="hero-badge hero-badge-rating">
                                <span className="hero-badge-icon"><Store size={16} /></span>
                                <div>
                                    <strong>{formattedCount(catalog?.sellers)} sellers</strong>
                                    <span>In the marketplace</span>
                                </div>
                            </div>

                            <div className="hero-badge hero-badge-delivery">
                                <span className="hero-badge-icon"><Truck size={18} /></span>
                                <div>
                                    <strong>Shop with confidence</strong>
                                    <span>Explore seller products</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6 order-1 order-lg-2">
                        <div className="hero-eyebrow">
                            <ShoppingBag size={16} />
                            OrderMe Marketplace
                        </div>

                        <h1 className="display-4 fw-bold lh-1 mb-3 hero-heading">
                            Find What You Need in One Place
                            <span className="hero-heading-accent"> Shop OrderMe</span>
                        </h1>

                        <p className="lead text-secondary mb-4 hero-description">
                            Search products from local sellers, compare your options, and shop directly from their stores.
                        </p>

                        <form onSubmit={handleSearch} className="bg-white rounded-4 shadow-sm p-2 mb-4 hero-search-card">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-0">
                                    <Search size={20} className="text-secondary" />
                                </span>
                                <input
                                    type="search"
                                    className="form-control border-0 shadow-none"
                                    placeholder="What are you looking for?"
                                    aria-label="Search products, brands, or categories"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                />
                                <button className="btn hero-btn-primary rounded-pill px-4" type="submit" aria-label="Search products">
                                    <Search size={18} />
                                </button>
                            </div>
                        </form>

                        <div className="d-flex flex-wrap gap-3 mb-5">
                            <button
                                type="button"
                                className="btn hero-btn-primary rounded-pill px-4 py-3 fw-semibold d-flex align-items-center gap-2"
                                onClick={() => navigate("/products")}
                            >
                                Start Shopping <ArrowRight size={19} />
                            </button>
                            <button
                                type="button"
                                className="btn hero-btn-outline rounded-pill px-4 py-3 fw-semibold"
                                onClick={() => navigate("/sellers")}
                            >
                                Explore Sellers
                            </button>
                        </div>

                        <div className="hero-stats d-flex flex-wrap gap-4">
                            <div className="hero-stat"><Package size={20} /><div><strong>{formattedCount(catalog?.products)}</strong><span>Products</span></div></div>
                            <div className="hero-stat"><Users size={20} /><div><strong>{formattedCount(catalog?.sellers)}</strong><span>Sellers</span></div></div>
                            <div className="hero-stat"><Layers3 size={20} /><div><strong>{formattedCount(catalog?.categories)}</strong><span>Categories</span></div></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Hero;
