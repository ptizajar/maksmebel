import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminCategoryCard } from "../components/AdminCategoryCard";
import { showDialog } from "../components/Dialog";
import { AddCategoryForm } from "../components/AddCategoryForm";
import c from "../css/.module/categoryCard.module.css";
import l from "../css/.module/layout.module.css";
import a from "../css/.module/admin.module.css";
import { forAdminOnly } from "../components/ForAdminOnly";
import t from "../css/.module/toast.module.css";
import { Toast } from "../components/Toast";
import { setUser } from "../store";
import { useDispatch } from "react-redux";

function Admin() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
  useEffect(() => {
    load();
  }, [])

  return (
    <>
      <div className={a.adminContainer}>
        <h1 className={`${l.title} ${l.titleNoMargin}`}>Администрирование</h1>
        <button className={`${a.adminButton} ${a.ml10}`} onClick={() => showDialog(AddCategoryForm, undefined, load)}>
          Добавить категорию
        </button>
        <button className={`${a.adminButton} ${a.selfEnd}`} onClick={logout} >Выйти</button>
      </div>

      <div className={c.cardHolder}>
        {categories.map((category) => (
          <AdminCategoryCard
            key={category.category_id}
            category_id={category.category_id}
            name={category.category_name}
            onClose={load}
          ></AdminCategoryCard>
        ))}
      </div>
      <Toast message={error} onClose={() => setError("")}/>
    </>

  );


}

export default forAdminOnly(Admin);
