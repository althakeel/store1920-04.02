import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import placeholderImg from "../../assets/images/Skelton.png";
import { getChildCategories } from "../../api/woocommerce";
import Static1 from "../../assets/images/megamenu/Main catogory webp/Electronics & Smart Devices.webp";
import Static2 from "../../assets/images/megamenu/Main catogory webp/Home Appliances.webp";
import Static3 from "../../assets/images/megamenu/Main catogory webp/Home Improvement & Tools.webp";
import Static9 from "../../assets/images/megamenu/Main catogory webp/Beauty & Personal Care.webp";
import Static11 from "../../assets/images/megamenu/Main catogory webp/Baby, Kids & Maternity.webp";
import Static14 from "../../assets/images/megamenu/Main catogory webp/Automotive & Motorcycle.webp";
import Static18 from "../../assets/images/megamenu/Main catogory webp/Home & Kitchen.webp";
import Static19 from "../../assets/images/megamenu/Main catogory webp/Home & Living.webp";
import Static20 from "../../assets/images/megamenu/Main catogory webp/Home & Garden.webp";
import Static21 from "../../assets/images/megamenu/Main catogory webp/Baby & Kids.webp";
import Static22 from "../../assets/images/megamenu/Main catogory webp/Automotive.webp";
import Static23 from "../../assets/images/megamenu/Main catogory webp/Electronics.webp";
import Static24 from "../../assets/images/megamenu/Main catogory webp/Pet Supplies.webp";
import Static26 from "../../assets/images/megamenu/Main catogory webp/Travel & Luggage.webp";
import Static27 from "../../assets/images/megamenu/Main catogory webp/Fashion.webp";
import Static28 from "../../assets/images/megamenu/Main catogory webp/Home & Bathroom.webp";
import Static29 from "../../assets/images/megamenu/Main catogory webp/Tools & Hardware.webp";
import Static30 from "../../assets/images/megamenu/Main catogory webp/Mobile Accessories.webp";
import Static31 from "../../assets/images/megamenu/Main catogory webp/Car Accessories.webp";
import Static32 from "../../assets/images/megamenu/Main catogory webp/Smart Gadgets & Electronics.webp";
import Static33 from "../../assets/images/megamenu/Main catogory webp/Computer & Office Accessories.webp";
import Static34 from "../../assets/images/megamenu/Main catogory webp/Gaming Accessories.webp";
import Static35 from "../../assets/images/megamenu/Main catogory webp/Cables & Connectivity.webp";
import Static36 from "../../assets/images/megamenu/Main catogory webp/Power & Energy.webp";
import Static37 from "../../assets/images/megamenu/Main catogory webp/Audio & Sound.webp";

// Decode HTML entities in category names
const decodeHTML = (html) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const MOBILE_CATEGORY_CACHE_KEY = "mobile-categories-v2";

const STATIC_CATEGORIES = [
  { id: "498", name: "Electronics & Smart Devices", image: Static1, path: "/category/electronics-smart-devices", slug: "electronics-smart-devices" },
  { id: "6519", name: "Home Appliances", image: Static2, path: "/category/home-appliances", slug: "home-appliances" },
  { id: "6520", name: "Home Improvement & Tools", image: Static3, path: "/category/home-improvement-tools", slug: "home-improvement-tools" },
  { id: "6534", name: "Home & Kitchen", image: Static18, path: "/category/home-kitchen", slug: "home-kitchen" },
  { id: "6535", name: "Home & Living", image: Static19, path: "/category/home-living-electronics", slug: "home-living-electronics" },
  { id: "6536", name: "Home & Garden", image: Static20, path: "/category/home-garden", slug: "home-garden" },
  { id: "6537", name: "Baby & Kids", image: Static21, path: "/category/baby-kids", slug: "baby-kids" },
  { id: "6538", name: "Automotive", image: Static22, path: "/category/automotive", slug: "automotive" },
  { id: "6539", name: "Electronics", image: Static23, path: "/category/electronics", slug: "electronics" },
  { id: "6540", name: "Pet Supplies", image: Static24, path: "/category/pet-supplies", slug: "pet-supplies" },
  { id: "6541", name: "Travel & Luggage", image: Static26, path: "/category/travel-luggage", slug: "travel-luggage" },
  { id: "6542", name: "Fashion", image: Static27, path: "/category/fashion", slug: "fashion" },
  { id: "6543", name: "Home & Bathroom", image: Static28, path: "/category/home-bathroom", slug: "home-bathroom" },
  { id: "6544", name: "Tools & Hardware", image: Static29, path: "/category/hand-tools-power-tools", slug: "hand-tools-power-tools" },
  { id: "6545", name: "Mobile Accessories", image: Static30, path: "/category/mobile-accessories", slug: "mobile-accessories" },
  { id: "6546", name: "Car Accessories", image: Static31, path: "/category/car-accessories", slug: "car-accessories" },
  { id: "6547", name: "Smart Gadgets & Electronics", image: Static32, path: "/category/smart-gadgets-electronics", slug: "smart-gadgets-electronics" },
  { id: "6548", name: "Computer & Office Accessories", image: Static33, path: "/category/computer-office-accessories", slug: "computer-office-accessories" },
  { id: "6549", name: "Gaming Accessories", image: Static34, path: "/category/gaming-accessories", slug: "gaming-accessories" },
  { id: "6550", name: "Cables & Connectivity", image: Static35, path: "/category/cables-connectivity", slug: "cables-connectivity" },
  { id: "6551", name: "Power & Energy", image: Static36, path: "/category/power-energy", slug: "power-energy" },
  { id: "6552", name: "Audio & Sound", image: Static37, path: "/category/audio-sound", slug: "audio-sound" },
  { id: "6526", name: "Beauty & Personal Care", image: Static9, path: "/category/beauty-personal-care", slug: "beauty-personal-care" },
  { id: "6528", name: "Baby, Kids & Maternity", image: Static11, path: "/category/baby-kids-maternity", slug: "baby-kids-maternity" },
  { id: "6531", name: "Automotive & Motorcycle", image: Static14, path: "/category/automotive-motorcycle", slug: "automotive-motorcycle" },
];

const STATIC_CATEGORY_MAP = STATIC_CATEGORIES.reduce((acc, category) => {
  acc[category.slug] = category;
  acc[category.id] = category;
  return acc;
}, {});

const mergeCategoriesWithStaticImages = (apiCategories = []) => {
  if (!Array.isArray(apiCategories) || apiCategories.length === 0) {
    return STATIC_CATEGORIES;
  }

  const apiBySlug = new Map(apiCategories.map((category) => [category.slug, category]));
  const apiById = new Map(apiCategories.map((category) => [String(category.id), category]));

  return STATIC_CATEGORIES.map((staticCategory) => {
    const matchedCategory =
      apiBySlug.get(staticCategory.slug) || apiById.get(String(staticCategory.id));

    return {
      ...matchedCategory,
      ...staticCategory,
      image:
        matchedCategory?.image?.src ||
        matchedCategory?.image ||
        staticCategory.image,
    };
  });
};

const CategorySlider = () => {
  const [categories, setCategories] = useState(STATIC_CATEGORIES);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cached = localStorage.getItem(MOBILE_CATEGORY_CACHE_KEY);
        if (cached) {
          setCategories(JSON.parse(cached));
          return;
        }

        // Fetch top-level categories (parent = 0)
        const cats = await getChildCategories(0);
        const mergedCategories = mergeCategoriesWithStaticImages(cats);

        if (mergedCategories.length > 0) {
          setCategories(mergedCategories);
          localStorage.setItem(MOBILE_CATEGORY_CACHE_KEY, JSON.stringify(mergedCategories));
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategories(STATIC_CATEGORIES);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div
      style={{
        overflowX: "auto",
        padding: "10px",
        marginBottom: "10px",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "nowrap",
          scrollSnapType: "x mandatory",
        }}
      >
        {categories.length === 0
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  flex: "0 0 auto",
                  width: 110,
                  height: 145,
                  background: "#eee",
                  borderRadius: 10,
                  scrollSnapAlign: "start",
                }}
              />
            ))
          : categories.map((cat) => {
              const name = decodeHTML(cat.name);
              const staticCategory =
                STATIC_CATEGORY_MAP[cat.slug] || STATIC_CATEGORY_MAP[String(cat.id)];
              const imgSrc =
                cat.image?.src ||
                cat.image ||
                staticCategory?.image ||
                placeholderImg;

              return (
                <Link
                  key={cat.id}
                  to={cat.path || `/category/${cat.slug}`}
                  style={{
                    flex: "0 0 auto",
                    width: 110,
                    borderRadius: 10,
                    backgroundColor: "#fff",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
                    textDecoration: "none",
                    color: "#000",
                    scrollSnapAlign: "start",
                    display: "block",
                  }}
                >
                  <img
                    src={imgSrc}
                    alt={name}
                    style={{
                      width: "100%",
                      height: 90,
                      objectFit: "cover",
                      borderTopLeftRadius: 10,
                      borderTopRightRadius: 10,
                      background: "#f9f9f9",
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = placeholderImg; // Fallback if image fails
                    }}
                  />
                  <div
                    style={{
                      padding: "6px 5px",
                      fontSize: 12,
                      fontWeight: 500,
                      textAlign: "center",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {name}
                  </div>
                </Link>
              );
            })}
      </div>
    </div>
  );
};

export default CategorySlider;
