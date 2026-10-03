import React from "react";
import FeaturedProducts from "../components/FeaturedProduct";
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import Deals from "../components/Deals";
import TopSellers from "../components/TopSellers";


function Home() {
    return (
        <>
            
            <Hero />
            <Categories />
            <FeaturedProducts />
            <Deals />
            <TopSellers />
           
        </>
    );
}
export default Home;
