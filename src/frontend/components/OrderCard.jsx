import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import f from "../css/.module/form.module.css";
import t from "../css/.module/toast.module.css";
import { Toast } from "./Toast";
export function OrderCard({ order_id, email, user_name, item_id, article, price, recall, phone, status, company, date, onStatusChange }) {
    const currentUser = useSelector((state) => state.user.currentUser);
    const [error, setError] = useState("");
    const [currentStatus, setCurrentStatus] = useState(status);
    function confirmed() {
        changeStatus("Подтвержден");
    }
    function canceled() {
        changeStatus("Отменен");
    }
    function completed ()  {
        changeStatus('Выполнен');
    }

    async function changeStatus(newStatus) {
        const formData = new FormData();
        formData.append("status", newStatus);
        formData.append("id", order_id);
        const res = await fetch(`/api/admin/changeStatus`, {
            method: 'PUT',
            body: formData
        })
        if (!res.ok) {
            const err = await res.json();
            setError(err.error);
            setTimeout(() => setError(""), 5000);
            return;
        }
        setCurrentStatus(newStatus);
        onStatusChange();
    }


    return (
        <>
            <div className={`${f.form} ${f.formCard}`}>
                <p className={`${f.title} ${f.titleSmall}`}>Заявка от </p>
                <p className={`${f.title} ${f.titleSmall}`}>{date} </p>

                {currentUser?.is_admin && (
                    <div className={f.inputHolder}>
                        <span className={f.label}>Email</span>
                        <p className={f.field}>{email} </p>
                    </div>
                )}

                {currentUser?.is_admin && (
                    <div className={f.inputHolder}>
                        <span className={f.label}>Компания</span>
                        <p className={f.field}>{company} </p>
                    </div>
                )}

                <div className={f.inputHolder}>
                    <span className={f.label}>Имя</span>
                    <p className={f.field} > {user_name} </p>
                </div>

                <div className={f.inputHolder}>
                    <span className={f.label}>Номер телефона</span>
                    <p className={f.field} >{phone} </p>
                </div>

                <div className={f.inputHolder}>
                    <span className={f.label}>Товар</span>
                    <Link to={`/item/${item_id}`} className={`${f.field} ${f.linkField}`}>
                        {article}
                    </Link>
                </div>

                <div className={f.inputHolder}>
                    <span className={f.label}>Цена</span>
                    <p className={f.field} >{price}</p>
                </div>

                <div className={f.inputHolder}>
                    <span className={f.label}>Когда перезвонить</span>
                    <p className={f.field} > {recall}  </p>
                </div>

                <div className={f.inputHolder}>
                    <span className={f.label}>Статус</span>
                    <p className={f.field} >  {status}  </p>
                </div>

                {/* Блок кнопок управления для админа */}
                {currentUser?.is_admin && (
                    <div className={f.buttonHolder}>
                        {status === 'Оформлен' && (
                            <>
                                <button className={`${f.button} ${f.buttonFit}`} onClick={confirmed}>Подтвердить</button>
                                <button className={f.button} onClick={canceled}>Отменить</button>
                            </>
                        )}
                        {status === 'Подтвержден' && (
                            <>
                                <button className={f.button} onClick={completed}>Выполнен</button>
                                <button className={f.button} onClick={canceled}>Отменить</button>
                            </>
                        )}
                        {/* Статусы 'Выполнен' и 'Отменён' — конечные, кнопок нет */}
                    </div>
                )}
            </div>
           
            <Toast message={error} onClose={() => setError("")}/>
        </>
    );
}


