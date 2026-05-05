import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import i from "../css/.module/itemCard.module.css";
import l from "../css/.module/layout.module.css";
import a from "../css/.module/admin.module.css";
import f from "../css/.module/form.module.css";
import t from "../css/.module/toast.module.css";
import { OrderCard } from "../components/OrderCard";
import { showDialog } from "../components/Dialog";
import { EditUserForm } from "../components/EditUserForm";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../store";
import { SessionExpired } from "../components/SessionExpired";
import { Toast } from "../components/Toast";


export function Account() {
  const [bids, setBids] = useState([]);
  const [userData, setUserData] = useState({});
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);
  const error401 = useRef(false);//была ли уже получена ошибка 401

  async function loadBids() {
    setError("");
    if (!currentUser) {
      return;
    }
    const res = await fetch(`/api/bids`, {
      method: 'GET'
    });
    if (res.status === 401 && !error401.current) {
      error401.current = true;
      showDialog(SessionExpired, undefined, () => {
        error401.current = false;
        dispatch(setUser(null));
        navigate('/')
      });
      return;
    }
    if (!res.ok && res.status !== 401) {
      const err = await res.json();
      setError(err.error);
      setTimeout(() => setError(""), 5000);
      return;
    }
    const data = await res.json();
    setBids(data);
  }

  async function loadData() {
    setError("");
    if (!currentUser) {
      return;
    }
    const res = await fetch(`/api/user_data`, {
      method: 'GET'
    });
    if (res.status === 401 && !error401.current) {
      error401.current = true;
      showDialog(SessionExpired, undefined, () => {
        error401.current = false;
        dispatch(setUser(null));
        navigate('/')
      });
      return;
    }
    if (!res.ok && res.status !== 401) {
      const err = await res.json();
      setError(err.error);
      setTimeout(() => setError(""), 5000);
      return;
    }
    const data = await res.json();
    setUserData(data);
  }


  async function logout() {
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

  async function deleteAcc() {
    setError("");
    const res = await fetch(`/api/delete_acc`, {
      method: 'DELETE'
    });
    if (res.status === 401 && !error401.current) {
      error401.current = true;
      showDialog(SessionExpired, undefined, () => {
        error401.current = false;
        dispatch(setUser(null));
        navigate('/')
      });
      return;
    }
    if (!res.ok && res.status !== 401) {
      const err = await res.json();
      setError(err.error);
      setTimeout(() => setError(""), 5000);
      return;
    }
    navigate('/');
    dispatch(setUser(null))

  }

  function loadOrNavigate(action) {//для следующего окна
    if (action === 'navigate') {
      dispatch(setUser(null));
      navigate('/')
    } else {
      loadData();
    }

  }
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
    loadBids();
    loadData();
    return () => {
      error401.current = false;// при размонтировании
    };
  }, [])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return (
    <>
      <h1 className={l.title}>Аккаунт</h1>
      <div className={f.userData}>
        <p className={f.labelBold}><b>Имя:</b> {userData.user_name} </p>
        <p className={f.labelBold}><b>Компания:</b> {userData?.company} </p>
        <p className={f.labelBold}><b>Номер телефона:</b> {userData.phone} </p>
        <p className={f.labelBold}><b>Email:</b> {userData.email}</p>
      </div>
      <div className={a.adminButtonContainer}>
        <button className={a.adminButton} onClick={() => showDialog(EditUserForm, undefined, loadOrNavigate)}>Редактировать</button>
        <button className={a.adminButton} onClick={logout}>Выйти</button>
        <button  className={`${i.adminButton} ${i.deleteButton} ${a.adminButtonNarrow}`}
          onClick={deleteAcc}>Удалить аккаунт</button>
      </div>

      <h1 className={l.title} >Заявки</h1>
      <div className={i.cardHolder}>
        {bids.map((bid) => (
          <OrderCard
            key={bid.order_id}
            order_id={bid.order_id}
            user_name={bid.user_name}
            item_id={bid.item_id}
            article={bid.article}
            price={bid.price}
            recall={formatDate(bid.recall_date)}
            phone={bid.phone}
            status={bid.status}
            date={formatDate(bid.date)}
            onClose={loadBids}
          ></OrderCard>
        ))}
      </div>
       <Toast message={error} onClose={() => setError("")}/>
    </>

  );


}



