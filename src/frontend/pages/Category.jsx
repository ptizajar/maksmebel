import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ItemCard } from "../components/ItemCard";
import l from "../css/.module/layout.module.css";
import i from "../css/.module/itemCard.module.css"
import t from "../css/.module/toast.module.css";
import { Toast } from "../components/Toast";
import { Loader } from "../components/Loader";
import ld from "../css/.module/loader.module.css"


export function Category() {
  const { category_id } = useParams();
  const [error, setError] = useState("");
  const [categoryName, setCategoryName] = useState(null);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadCategory() {
    const res = await fetch(`/api/category/${category_id}`);
    if (!res.ok) {
      const err = await res.json();
      setError(err.error);
      setTimeout(() => setError(""), 5000);
      setIsLoading(false);
      return;
    }
    const data = await res.json();
    setCategoryName(data.category_name);
  }

  async function loadItems() {
    const res = await fetch(`/api/category/${category_id}/items`);
    if (!res.ok) {
      const err = await res.json();
      setError(err.error);
      setTimeout(() => setError(""), 5000);
      setIsLoading(false);
      return;
    }
    const data = await res.json();
    setItems(data);
    setIsLoading(false);
  }
  useEffect(() => { loadCategory() }, []);
  useEffect(() => { loadItems() }, []);


  return (
    <>
      <h1 className={l.title}>{categoryName}</h1>
      {isLoading && (
        <Loader />
      )}
      {!isLoading && <div className={i.cardHolder} >
        {items.map((item) => (
          <div className={i.cardWrapper}>
            <ItemCard
              key={item.item_id}
              item_id={item.item_id}
              name={item.item_name}
              price={item.price}
              liked={item.liked}
              width={Math.round(item.width)}
              height={Math.round(item.height)}
              length={Math.round(item.length)}
              removed={item.removed}
            ></ItemCard>
          </div>
        ))}
      </div>}
      <Toast message={error} onClose={() => setError("")} />
    </>
  );
}


