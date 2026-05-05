import f from "../css/.module/form.module.css"
import { useState } from "react";
import { useValidation } from "../validation/useValidation";
import t from "../css/.module/toast.module.css";
import { showDialog } from "./Dialog";
import { useSelector } from "react-redux";
import React from "react";
import { SessionExpired } from "./SessionExpired";
import { Toast } from "./Toast";


export function OrderForm({ onCloseClick, param }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const currentUser = useSelector((state) => state.user.currentUser);
    const { errors, checkField, checkForm, clearErrors } = useValidation('order');

    // Функция для расчета минимальной даты
    const getMinDateTime = () => {
        const now = new Date();
        const minDate = new Date(now);
        minDate.setMinutes(minDate.getMinutes() + 30); // +30 минут

        // Если время попадает в рабочие часы сегодня (10:00-17:00)
        const hours = minDate.getHours();
        if (hours >= 10 && hours < 17) {
            return minDate.toISOString().slice(0, 16);
        }

        // Иначе ставим завтра 10:00
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        return tomorrow.toISOString().slice(0, 16);
    };

    // Функция для расчета максимальной даты
    const getMaxDateTime = () => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 14); // +2 недели
        maxDate.setHours(16, 59, 0, 0); // Последнее рабочее время
        return maxDate.toISOString().slice(0, 16);
    };

    async function save(e) {
        e.preventDefault();
        setError("");
        if (!currentUser) {
            setError('Войдите, чтобы оставить заявку на заказ');
            setTimeout(() => setError(""), 5000);
            return;
        }

        const formData = new FormData(e.target);
        const formObject = {
            user_name: formData.get('user_name') || '',
            phone: formData.get('phone') || '',
            preferred_datetime: formData.get('preferred_datetime') || ''
        };

        // Проверяем обязательные поля
        const isValid = checkForm(formObject);
        if (!isValid) return;

        setIsSubmitting(true);

        const res = await fetch(`/api/order/${param.item_id}`, {
            method: 'POST',
            body: formData
        });
        if (res.status === 401) {
            showDialog(SessionExpired, undefined, onCloseClick);
            setIsSubmitting(false);
            return;
        }
        if (!res.ok && res.status !== 401) {
            const err = await res.json();
            setError(err.error);
            setTimeout(() => setError(""), 5000);
            setIsSubmitting(false);
            return;
        }

        await res.json();
        clearErrors();
        onCloseClick("success");
    }

    return (
        <>
            <form className={f.form} onSubmit={save} id="orderForm" method="POST" encType="multipart/form-data">
                <p className={f.title}>Оформить заявку</p>
                <div className={f.inputHolder}>
                    <label className={`${f.label} ${f.labelRequired}`}>
                        Как к Вам обращаться?
                    </label>
                    <input
                        type="text"
                        className={f.field}
                        placeholder="Имя"
                        name="user_name"
                        defaultValue={currentUser?.user_name}
                        required
                        onChange={(e) => checkField('user_name', e.target.value)}
                        onBlur={(e) => checkField('user_name', e.target.value)}
                        disabled={isSubmitting} />
                </div>
                {errors.user_name?.length > 0 && (
                    <div className={f.errorText}>
                        {errors.user_name[0]}
                    </div>
                )}

                <div className={`${f.label} ${f.labelRequired}`}>
                    <label className={f.label}>
                        Номер телефона
                    </label>
                    <input
                        type="tel"
                        className={f.field}
                        placeholder="Номер телефона"
                        name="phone"
                        defaultValue={currentUser?.phone}
                        required
                        onChange={(e) => checkField('phone', e.target.value)}
                        onBlur={(e) => checkField('phone', e.target.value)}
                        disabled={isSubmitting} />
                </div>
                {errors.phone?.length > 0 && (
                    <div className={f.errorText}>
                        {errors.phone[0]}
                    </div>
                )}


                <div className={f.inputHolder}>
                    <label className={`${f.label} ${f.labelRequired}`}>
                        Удобные дата и время (МСК):
                    </label>

                    <input
                        type="datetime-local"
                        // defaultValue={getMinDateTime()}
                        className={f.field}
                        name="preferred_datetime"
                        // min={getMinDateTime()}
                        // max={getMaxDateTime()}
                        required
                        disabled={isSubmitting}
                        onChange={(e) => checkField('preferred_datetime', e.target.value)}
                        onBlur={(e) => checkField('preferred_datetime', e.target.value)}
                    />


                    {errors.preferred_datetime?.length > 0 && (
                        <div className={f.errorText}>
                            {errors.preferred_datetime[0]}
                        </div>
                    )}
                    <div className={f.label} style={{ fontSize: "12px", marginTop: "10px", textAlign: "center" }}>
                        Рабочие часы: с 10:00 до 17:00<br />
                        Выберите время в ближайшие 14 дней
                    </div>
                </div>

                <div className={f.buttonHolder}>
                    <button
                        className={f.button}
                        type="submit"
                        disabled={isSubmitting}
                    >
                        ОК
                    </button>
                    <button
                        className={f.button}
                        onClick={() => {
                            clearErrors();
                            onCloseClick();
                        }}
                        disabled={isSubmitting}
                    >
                        Отмена
                    </button>
                </div>
            </form>

            <Toast message={error} onClose={() => setError("")}/>
        </>
    )
}