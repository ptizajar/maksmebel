import React, { useState } from "react"
import f from "../css/.module/form.module.css"
import { showDialog } from "./Dialog";
import { RegistrationForm } from "./RegistrationForm";
import { useDispatch } from "react-redux";
import { setUser } from "../store";
import { ChangePassword } from "./ChangePassword";
import t from "../css/.module/toast.module.css";
import { Eye, EyeClosed } from "lucide-react";
import { Toast } from "./Toast";


export function LoginForm({ onCloseClick }) {
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    function switchForm(newform) {
        showDialog(newform);
        onCloseClick();
    }
    async function save(e) {
        e.preventDefault();
        setIsSubmitting(true);
        const res = await fetch(`/api/login`, {
            method: 'POST',
            body: new FormData(loginForm)

        });
        if (!res.ok) {
            const err = await res.json();
            setIsSubmitting(false);
            setError(err.error);
            setTimeout(() => setError(""), 5000);
            return;
        }
        const result = await res.json();



        dispatch(setUser(result));
        setIsSubmitting(false);
        onCloseClick();
    }



    return (
        <>
            <form className={f.form} onSubmit={save} id="loginForm" method="POST" encType="multipart/form-data">
                <p className={f.title}>Войти</p>
                <div className={f.inputHolder}>
                    <label className={f.label}>Email</label>
                    <input type="text" className={f.field} name="email" required />
                </div>

                {/* Поле Пароль с глазиком */}
                <div className={`${f.inputHolder} ${f.passwordWrapper}`}>
                    <label className={f.label}>Пароль</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        className={`${f.field} ${f.fieldPassword}`}
                        name="password"
                        required
                        disabled={isSubmitting}
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSubmitting}
                        className={f.togglePasswordBtn}
                        aria-label={showPassword ? "Показать пароль" : "Скрыть пароль"}
                    >
                        {showPassword ?
                            <Eye size={18} strokeWidth={2.5} color="#2A3E3C"/> :
                            <EyeClosed size={18} strokeWidth={2.5} color="#2A3E3C"/>
                        }
                    </button>
                </div>

                <div className={f.buttonHolder}>
                    <button className={f.button} type="submit">ОК</button>
                    <button className={f.button} onClick={onCloseClick}>Отмена</button>
                </div>
                <div className={`${f.buttonHolder} ${f.buttonCenter}`}>
                    <button className={`${f.button} ${f.buttonWide}`} onClick={() => switchForm(ChangePassword)}>Не помню пароль</button>
                </div>

                <p className={`${f.label} ${f.marginTop10}`}>Ещё нет аккаунта?</p>
                <div className={`${f.buttonHolder} ${f.buttonCenter}`}>
                    <button className={`${f.button} ${f.buttonWide}`} onClick={() => switchForm(RegistrationForm)}>Зарегистрироваться</button>
                </div>
            </form>
            <Toast message={error} onClose={() => setError("")}/></>
    )
}
