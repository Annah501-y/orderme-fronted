import React from "react";

function CategoryCard({ category }) {
    return (
        <div className="category-card">
            <img
                src={category.image}
                alt={category.name}
                className="category-image"
            />

            <h3 className="category-name">
                {category.name}
            </h3>

            <p>
                {category.description}
            </p>
        </div>
    );
}

export default CategoryCard;