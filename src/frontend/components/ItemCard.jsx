import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import i from "../css/.module/itemCard.module.css"
import { showDialog } from "./Dialog";
import { SessionExpired } from "./SessionExpired";
import { setUser } from "../store";
import { LoginForm } from "./LoginForm";
import { Heart } from "lucide-react";
import { Toast } from "./Toast";
import t from "../css/.module/toast.module.css";
export function ItemCard({ item_id, name, price, liked, length, width, height, removed }) {
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [currentLiked, setCurrentLiked] = useState(liked);
  const currentUser = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();

  async function like(e) {
    e.preventDefault();
    if (!currentUser) {
      showDialog(LoginForm)
      return;
    }
    if (currentUser.is_admin) {
      setError('Администраторам нельзя добавлять товары в избранное');
      setTimeout(() => setError(""), 5000);
      return;
    }
    const formData = new FormData();
    formData.append("item_id", item_id);
    formData.append("liked", !currentLiked);
    const res = await fetch(`/api/favourites`, {
      method: 'POST',
      body: formData
    })
    if (res.status === 401) {
      showDialog(SessionExpired, undefined, () => { dispatch(setUser(null)); navigate('/') });
      onCloseClick();
      return;
    }
    if (!res.ok && res.status !== 401) {
      const err = await res.json();
      setError(err.error);
      setTimeout(() => setError(""), 5000);
      return;
    }
    const newLiked = !currentLiked;
    setCurrentLiked(newLiked);

    if (newLiked) {
      setToast("Товар добавлен в избранное");
    } else {
      setToast("Товар удалён из избранного");
    }

    setTimeout(() => setToast(""), 5000);
  }
  const style = removed ? { filter: "grayscale(100%)" } : {};
  return (
    <>

      <Link className={i.card} to={`/item/${item_id}`}>

        <button className={i.icon} onClick={like}>
          {currentLiked ? (
            <Heart size={30} strokeWidth={2} fill="#2A3E3C" color="#2A3E3C" />
          ) : (
            <Heart size={30} strokeWidth={2} color="#2A3E3C" />
          )}
        </button>

        <div className={`${i.imageHolder} ${removed ? i.removed : ""}`}>
          <img
            className={i.image}
            src={`/api/item/image/${item_id}`}
            alt="товар"
          />

          {removed && <div className={i.badge}>Скрыт</div>}
        </div>

        <p className={i.name}>{name}</p>
        <p className={i.size}>{length} х {width} х {height} см</p>
        <p className={i.price}>{price} ₽</p>

      </Link>

      {error && (
        <Toast message={error} onClose={() => setError("")}/>
      )}
      {toast && (
         <Toast message={toast} onClose={() => setToast("")}/>
      )}
    </>
  );
}


