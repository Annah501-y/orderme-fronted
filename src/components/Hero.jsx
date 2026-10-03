import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import "../components_styles/hero.css";

function Hero() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = (event) => {
        event.preventDefault();
        const query = searchTerm.trim();
        navigate(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
    };

    return (
        <section className="hero-section marketplace-hero">
            <div className="container">
                <div className="marketplace-hero-copy">
                    <span className="hero-eyebrow">Made for your kind of shopping</span>
                    <h1 className="hero-heading">Find something <span className="hero-heading-accent">you will love.</span></h1>
                    <p className="hero-description">Discover great finds from independent shops and local sellers across Tanzania.</p>
                    
                    <button className="marketplace-shop-link" type="button" onClick={() => navigate("/products")}>
                        Explore all products <ArrowRight size={17} />
                    </button>
                </div>
            </div>
        </section>
    );
}

export default Hero;
