import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AddItemForm } from "../components/AddItemForm";
import { AdminItemCard } from "../components/AdminItemCard";
import l from "../css/.module/layout.module.css";
import a from "../css/.module/admin.module.css";
import { showDialog } from "../components/Dialog";
import i from "../css/.module/itemCard.module.css"
import { forAdminOnly } from "../components/ForAdminOnly";
import t from "../css/.module/toast.module.css";
import { Toast } from "../components/Toast";
import { setUser } from "../store";
import { useDispatch } from "react-redux";

function AdminCategory() {
  const { category_id } = useParams();
  const [error, setError] = useState("");
  const [categoryName, setCategoryName] = useState(null);
  const [items, setItems] = useState([]);
  const dispatch = useDispatch();
  const navigate=useNavigate();

  async function loadCategory() {
    const res = await fetch(`/api/category/${category_id}`);
    if (!res.ok) {
      const err = await res.json();
      setError(err.error);
      setTimeout(() => setError(""), 5000);
      return;
    }
    const data = await res.json();
    setCategoryName(data.category_name);
  }

  async function loadItems() {
    const res = await fetch(`/api/admin/category/${category_id}/all_items`);
    if (!res.ok) {
      const err = await res.json();
      setError(err.error);
      setTimeout(() => setError(""), 5000);
      return;
    }
    const data = await res.json();
    setItems(data);
  }
  async function logout(e) {
    e.preventDefault();
    setError("");

    const res = await fetch(`/api/logout`, {
      method: 'POST'

    });
    if (!res.ok) {
      const err = await res.json();
      setError(err.error);
      setTimeout(() => setError(""), 5000);
      return;
    }
    navigate('/');
    dispatch(setUser(null))
  }
  useEffect(() => { loadCategory() }, []);
  useEffect(() => { loadItems() }, []);


  return (
    <>

      <div className={a.adminContainer}>
        <h1 className={`${l.title} ${l.titleNoMargin}`}>{categoryName}</h1>
        <button className={a.adminButton} onClick={() => showDialog(AddItemForm, { category_id }, loadItems)}>Добавить товар</button>
        <button className={`${a.adminButton} ${a.selfEnd}`} onClick={logout}>Выйти</button>
      </div>


      <div className={i.cardHolder}>
        {items.map((item) => (

          <AdminItemCard
            key={item.item_id}
            item_id={item.item_id}
            name={item.item_name}
            price={item.price}
            width={Math.round(item.width)}
            height={Math.round(item.height)}
            length={Math.round(item.length)}
            liked={item.liked}
            onClose={loadItems}
            removed={item.removed}
          ></AdminItemCard>

        ))}
      </div>
      <Toast message={error} onClose={() => setError("")}/>
    </>
  );
}

export default forAdminOnly(AdminCategory);
