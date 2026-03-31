import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/Categories.css';
import { megaMenuCategories } from '../components/sub/megamenu';

const CategoryList = () => {
  const [visibleCount, setVisibleCount] = useState(25);

  const categories = useMemo(
    () =>
      megaMenuCategories
        .filter((category) => Array.isArray(category.subCategories) && category.subCategories.length > 0)
        .map((category) => {
          const primarySubCategory = category.subCategories[0];

          return {
            id: category.id,
            name: category.name,
            image: primarySubCategory?.image,
            path: primarySubCategory?.path || '#',
          };
        }),
    []
  );

  const loadMore = () => setVisibleCount((prev) => prev + 25);
  const displayedCategories = categories.slice(0, visibleCount);

  return (
    <div className="category-wrapper">
      <div className="category-topbar">
        <h1 className="category-heading">Browse Categories</h1>
      </div>

      <div className="category-grid">
        {displayedCategories.map((category) => (
          <Link to={category.path} key={category.id} className="category-card">
            <div className="card-content">
              <img src={category.image} alt={category.name} className="category-img" />
              <p className="category-name">{category.name}</p>
            </div>
          </Link>
        ))}
      </div>

      {visibleCount < categories.length && (
        <div className="loadmore-section">
          <button className="loadmore-button" onClick={loadMore}>
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
