import f from "../css/.module/form.module.css"
import { useState } from "react";
import { useValidation } from "../validation/useValidation";
import t from "../css/.module/toast.module.css";
import { showDialog } from "./Dialog";
import { useSelector } from "react-redux";
import React from "react";
import { SessionExpired } from "./SessionExpired";
import { Toast } from "./Toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";
import InputMask from "react-input-mask";


export function OrderForm({ onCloseClick, param }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [selectedDate, setSelectedDate] = useState(null);
    const currentUser = useSelector((state) => state.user.currentUser);
    const { errors, checkField, checkForm, clearErrors } = useValidation('order');

    function handleDateChange(date) {
        setSelectedDate(date);
        if (!date) {
            checkField("preferred_datetime", "");
            return;
        }
        checkField(
            "preferred_datetime",
            date.toISOString()
        );
    }
    async function save(e) {
        e.preventDefault();
        setError("");
        if (!currentUser) {
            setError('Войдите, чтобы оставить заявку на заказ');
            setTimeout(() => setError(""), 5000);
            return;
        }

        const formData = new FormData(e.target);
        if (selectedDate) {
            formData.set(
                "preferred_datetime",
                selectedDate.toISOString()
            );
        }
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
    const maxOrderDate = new Date();
    maxOrderDate.setDate(maxOrderDate.getDate() + 30);

    const CustomDateInput = React.forwardRef(
        ({ value, onClick, placeholder }, ref) => (
            <div className={f.datePickerWrapper}>
                <input
                    ref={ref}
                    value={value}
                    onClick={onClick}
                    placeholder={placeholder}
                    className={f.field}
                    readOnly
                />
                <Calendar className={f.calendarIcon} />
            </div>
        )
    );


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

                <div className={f.inputHolder}>
                    <label className={`${f.label} ${f.labelRequired}`}>
                        Номер телефона
                    </label>
                    <InputMask
                        mask="+7 (999) 999-99-99"
                        alwaysShowMask={true}
                        maskChar="_"
                        disabled={isSubmitting}
                        defaultValue={currentUser?.phone || ""}
                        onChange={(e) => checkField('phone', e.target.value)}
                        onBlur={(e) => checkField('phone', e.target.value)}
                    >
                        {(inputProps) => (
                            <input
                                {...inputProps}
                                type="tel"
                                className={f.field}
                                name="phone"
                                required

                            />
                        )}
                    </InputMask>
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
                    <DatePicker
                        selected={selectedDate}
                        onChange={handleDateChange}
                        showTimeSelect
                        timeCaption="Время"
                        timeFormat="HH:mm"
                        timeIntervals={30}
                        dateFormat="dd.MM.yyyy HH:mm"
                        placeholderText="дд.мм.гггг чч:мм"
                        disabled={isSubmitting}
                        minDate={new Date()}
                        maxDate={maxOrderDate}
                        required
                        customInput={<CustomDateInput />}
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

            <Toast message={error} onClose={() => setError("")} />
        </>
    )
}