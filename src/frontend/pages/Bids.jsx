import { forAdminOnly } from "../components/ForAdminOnly";
import React, { useEffect, useState } from "react";
import t from "../css/.module/toast.module.css";
import { Toast } from "../components/Toast";
import { OrderCard } from "../components/OrderCard";
import l from "../css/.module/layout.module.css";
import a from "../css/.module/admin.module.css";
import i from "../css/.module/itemCard.module.css";
import f from "../css/.module/favourites.module.css";
import fm from "../css/.module/form.module.css";
import { Loader } from "../components/Loader";
import ld from "../css/.module/loader.module.css"


function Bids() {
  const [allBids, setAllBids] = useState([]); // все заявки
  const [bids, setBids] = useState([]);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
    const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('Оформлен');


  async function fetchAllOrders() {
    const res = await fetch(`/api/admin/bids`);
    if (!res.ok) {
      const err = await res.json();
      setError(err.error);
      setTimeout(() => setError(""), 5000);
       setIsLoading(false);
      return;
    }
    const data = await res.json();
    setAllBids(data);
    const defaultFiltered = data.filter(bid => bid.status === 'Оформлен');
    setBids(defaultFiltered);
     setIsLoading(false);
  }


  function applyFilters(status) {
    let filtered = [...allBids];

    if (status !== 'Все') {
      filtered = filtered.filter(bid => bid.status === status);
    }

    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(bid => new Date(bid.date) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(bid => new Date(bid.date) <= end);
    }

    setBids(filtered);
  }
  function resetFilters() {
    setStartDate("");
    setEndDate("");
    setStatus('Оформлен'); // дефолт
  }
  useEffect(() => {
    fetchAllOrders();
  }, []);

  useEffect(() => {
    applyFilters(status);
  }, [status, startDate, endDate, allBids]);


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
      <h1 className={l.title}>Заявки</h1>

      <div className={a.adminButtonContainer}>

        <span className={fm.label}>Начало периода</span>
        <input
          className={`${fm.field} ${fm.dateInput}`}
          type="date"
          value={startDate}
          name="startDate"
          onChange={(e) => setStartDate(e.target.value)}
        />
        <span className={fm.label}>Конец периода</span>
        <input
          className={`${fm.field} ${fm.dateInput}`}
          type="date"
          value={endDate}
          name="endDate"
          onChange={(e) => setEndDate(e.target.value)}
        />

        <button className={a.adminButton} onClick={applyFilters}>
          Применить
        </button>
        <button className={a.adminButton} onClick={resetFilters}>
          Сбросить фильтры
        </button>

      </div>
      <div className={a.adminButtonContainer}>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={`${a.adminButton} ${a.selectFix}`}
          name="dateSelect"
        >
          <option value="Оформлен">Оформленные</option>
          <option value="Подтвержден">Подтвержденные</option>
          <option value="Отменен">Отмененные</option>
          <option value="Выполнен">Выполненные</option>
          <option value="Все">Все</option>
        </select>
      </div>
      {isLoading && (
              <Loader />
            )}
      {!isLoading && bids.length === 0 && <div className={f.noFavourites}>Заказов нет</div>}
      <div className={`${i.cardHolder} ${i.cardHolderSmallMargin}`}>
        {bids.map((bid) => (
          <OrderCard
            key={bid.order_id}
            order_id={bid.order_id}
            email={bid.email}
            user_name={bid.user_name}
            item_id={bid.item_id}
            article={bid.article}
            price={bid.price}
            recall={formatDate(bid.recall_date)}
            phone={bid.phone}
            status={bid.status}
            company={bid?.company}
            date={formatDate(bid.date)}
            onStatusChange={fetchAllOrders}
          ></OrderCard>
        ))}
      </div>
      <Toast message={error} onClose={() => setError("")}/>
    </>

  );


}


export default forAdminOnly(Bids);
