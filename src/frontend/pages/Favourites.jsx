import React, { useState } from "react";
import { ItemCard } from "../components/ItemCard";
import { useEffect } from "react";
import i from  "../css/.module/itemCard.module.css";
import f from  "../css/.module/favourites.module.css";
import l from "../css/.module/layout.module.css";
import t from "../css/.module/toast.module.css";
import { Toast } from "../components/Toast";
import { useSelector } from "react-redux";
import { showDialog } from "../components/Dialog";
import { SessionExpired } from "../components/SessionExpired";

export function Favourites() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const currentUser = useSelector((state) => state.user.currentUser);
  async function loadItems() {
    if (!currentUser) {
      return;
    }
    const res = await fetch(`/api/liked_items`);
    if (res.status === 401) {
      showDialog(SessionExpired);
      return;
    }
    if (!res.ok && res.status !== 401) {
      const err = await res.json();
      setError(err.error);
      setTimeout(() => setError(""), 5000);
      return;
    }
    const data = await res.json();
    setItems(data.favourites);
  }
  useEffect(() => { loadItems() }, [currentUser]);

  return (
    <>
      <p className={l.title}>Избранное</p>

      {!items.length && currentUser &&
        <div className={f.noFavourites}>
          <p>В избранном ничего нет</p>
          <p>Добавляйте товары в избранное, нажимая на <img src="/public/heart.svg"></img></p>
        </div>}

      {items.length > 0 && <div className={i.cardHolder}>
        {items.map(item => (
          <ItemCard
            key={item.item_id}
            item_id={item.item_id}
            name={item.item_name}
            width={Math.round(item.width)}
            height={Math.round(item.height)}
            length={Math.round(item.length)}
            price={item.price}
            liked={item.liked}
          />
        ))}
      </div>}


      <Toast message={error} onClose={() => setError("")}/>
    </>
  );
}


