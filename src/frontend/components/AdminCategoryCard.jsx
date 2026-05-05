import React, { useState } from "react";
import { Link } from "react-router-dom";
import {CategoryCard} from "./CategoryCard";
import { AddCategoryForm } from "./AddCategoryForm";
import { showDialog } from "./Dialog";
import c from "../css/.module/categoryCard.module.css"
import t from "../css/.module/toast.module.css";
import { Toast } from "./Toast";

export function AdminCategoryCard({ category_id, name, onClose }) {
  const [error, setError] = useState("");

  async function deleteCategory() {
    setError("");
    const res = await fetch(`/api/admin/delete_category/${category_id}`, {
      method: 'delete'
    });
    if (!res.ok) {
      const err = await res.json();
      setError(err.error);
      setTimeout(() => setError(""), 5000);
      return;
    }

    onClose();

  }
  return (
    <>
      <div>
        <CategoryCard category_id={category_id} name={name} url="admin_category" />
        <div className={c.adminButtonHolder}>
          <button className={c.adminButton} onClick={() => showDialog(AddCategoryForm, { name, category_id }, onClose)}>Редактировать</button>
          <button className={c.adminButton} onClick={deleteCategory}>Удалить</button>
        </div>
      </div>
        <Toast message={error} onClose={() => setError("")}/></>
  );
}

