import React, { useEffect, useState } from "react";
import t from "../css/.module/toast.module.css";
import { Toast } from "../components/Toast";
import { CategoryCard } from "../components/CategoryCard";
import c from "../css/.module/categoryCard.module.css"
import l from "../css/.module/layout.module.css";

export function Catalog() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  async function load() {
    const res = await fetch(`/api/categories`);
    if (!res.ok) {
      const err = await res.json();
      setError(err.error);
      setTimeout(() => setError(""), 5000);
      return;
    }
    const data = await res.json();
    setCategories(data);
  }

  useEffect(() => {
    load();
  }, [])


  return (
    <>
      <h1 className={l.title}>Каталог</h1>
      <div className={c.cardHolder}>
        {categories.map((category) => (
          <CategoryCard
            key={category.category_id}
            category_id={category.category_id}
            name={category.category_name}
            url={'category'}
          ></CategoryCard>
        ))}
      </div>
      <Toast message={error} onClose={() => setError("")}/>
    </>
  );


}


