import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import t from "../css/.module/toast.module.css";
import { Toast } from "../components/Toast";
import { OrderForm } from "../components/OrderForm";
import { showDialog } from "../components/Dialog";
import { setUser } from "../store";
import { useDispatch, useSelector } from "react-redux";
import { LoginForm } from "../components/LoginForm";
import l from "../css/.module/layout.module.css";
import i from "../css/.module/itemPage.module.css";
import a from "../css/.module/admin.module.css";
import h from "../css/.module/home.module.css"

export function ItemPage() {
  const { item_id } = useParams();
  const [item, setItem] = useState();
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);
  const [toast, setToast] = useState("");
  async function load() {

    const res = await fetch(`/api/item/${item_id}`);
    if (!res.ok) {
      const err = await res.json();
      setError(err.error);
      setTimeout(() => setError(""), 5000);
      return;
    }
    const data = await res.json();
    setItem(data);
  }

  function handleOrderClick() {
    if (!currentUser) {
      showDialog(LoginForm);
      return;
    }
    if (currentUser.is_admin) {
      setError('Администраторам нельзя оформлять заказы');
      setTimeout(() => setError(""), 5000);
      return;
    }
    showDialog(OrderForm, { item_id }, (action) => {
      if (action === "success") {
        setToast("Заявка оформлена");
        setTimeout(() => setToast(""), 5000);
      }
    });
  }

  useEffect(() => {
    load();
  }, [])



  return (
    <>
      <h1 className={l.title}>{item?.item_name}</h1>
      <div className={i.itemHolder}>
        <div className={i.image} style={{ backgroundImage: `url('/api/item/image/${item_id}')` }}></div>
        <div className={i.tableHolder}>
          <table className={i.table}>
            <tbody>
              <tr>
                <td>Артикул</td>
                <td>{item?.article}</td>
              </tr>
              <tr>
                <td>Название</td>
                <td>{item?.item_name}</td>
              </tr>
              <tr>
                <td>Длина</td>
                <td>{item?.length} см</td>
              </tr>
              <tr>
                <td>Ширина</td>
                <td>{item?.width} см</td>
              </tr>
              <tr>
                <td>Высота</td>
                <td>{item?.height} см</td>
              </tr>
              <tr>
                <td>Заказ от</td>
                <td>{item?.quantity} шт</td>
              </tr>
            </tbody>
          </table>
          <div className={i.priceHolder}>
            <p className={i.price}>{item?.price} ₽</p>
            {!item?.removed && <button className={a.adminButton} onClick={handleOrderClick}>Заказать</button>}
            {item?.removed && <p className={i.price}>Нет в продаже</p>}
          </div>
        </div>
      </div>

      <div className={`${h.info} ${h.infoWide}`}>{item?.description}</div>


      {error && (
        <Toast message={error} onClose={() => setError("")}/>
      )}
      {toast && (
         <Toast message={toast} onClose={() => setToast("")}/>
      )}
    </>
  );
}


