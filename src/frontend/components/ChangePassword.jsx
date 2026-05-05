import React, { useState } from "react"
import f from "../css/.module/form.module.css"
import { useValidation } from "../validation/useValidation"
import { Eye, EyeClosed } from "lucide-react";
import t from "../css/.module/toast.module.css";
import { Toast } from "./Toast";



export function ChangePassword({ onCloseClick }) {
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sent, setSent] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);
    const [savedEmail, setSavedEmail] = useState('');
    const { errors, checkField, checkForm, clearErrors } = useValidation('registration');

    async function confirm(e) {
        e.preventDefault();
        setError("");
        const formData = new FormData(document.getElementById('changePassword'));
        formData.append('email', savedEmail);
        const validationData = { password: formData.get('password') || '' };
        const isValid = checkForm(validationData);
        if (!isValid) return;
        const missMatch = formData.get("password") !== formData.get("password2");
        if (missMatch) {
            setError("Пароли не совпадают");
            setTimeout(() => setError(""), 5000);
            return;
        }
        setIsSubmitting(true)
        const res = await fetch(`/api/change_password`, {
            method: 'POST',
            body: formData
        });
        if (!res.ok) {
            const err = await res.json();
            setError(err.error);
            setTimeout(() => setError(""), 5000);
            setIsSubmitting(false);
            return;
        }
        await res.json();
        clearErrors();
        setIsSubmitting(false);
        onCloseClick();
    }

    async function send(e) {
        e.preventDefault();
        setError("");
        const formData = new FormData(document.getElementById('changePassword'));
        const emailValue = formData.get('email');
        const isValid = checkForm({ email: emailValue });
        if (!isValid) return;
        setIsSubmitting(true);
        const res = await fetch(`/api/send_code`, {
            method: 'PUT',
            body: formData
        });
        if (!res.ok) {
            const err = await res.json();
            setError(err.error);
            setTimeout(() => setError(""), 5000);
            setIsSubmitting(false);
            return;
        }
        await res.json();
        setSavedEmail(emailValue);
        setSent(true);
        clearErrors();
        setIsSubmitting(false);
    }

    return (
        <>
            <form className={f.form} onSubmit={sent ? confirm : send} id="changePassword" method="POST" encType="multipart/form-data">
                {sent ? <p className={f.title}>Мы выслали код на email</p> : <p className={f.title}>Подтверждение</p>}
        
                {!sent && (
                    <div className={f.inputHolder}>
                        <label className={f.label}>Email</label>
                        <input
                            type="text"
                            className={f.field}
                            name="email"
                            required
                            onBlur={(e) => checkField('email', e.target.value)}
                            onChange={(e) => checkField('email', e.target.value)}
                        />
                    </div>
                )}
                {errors.email?.length > 0 && (
                    <div className={f.errorText}>
                        {errors.email[0]}
                    </div>
                )}
                {sent && <>
                    <div className={f.inputHolder}>
                        <label className={f.label}>Код</label>
                        <input type="text" className={f.field} name="code" required />
                    </div>
                    <div className={`${f.inputHolder} ${f.passwordWrapper}`}>
                        <label className={f.label}>Пароль</label>
                        <input
                            type={showPasswords ? "text" : "password"}
                            className={`${f.field} ${f.fieldPassword}`}
                            name="password"
                            required
                            disabled={isSubmitting}
                            onChange={(e) => checkField('password', e.target.value)}
                            onBlur={(e) => checkField('password', e.target.value)}
                        />

                        <button
                            type="button"
                            onClick={() => setShowPasswords(!showPasswords)}
                            disabled={isSubmitting}
                            className={f.togglePasswordBtn}
                        >
                            {showPasswords
                                ? <Eye size={18} strokeWidth={2.5} color="#2A3E3C" />
                                : <EyeClosed size={18} strokeWidth={2.5} color="#2A3E3C" />
                            }
                        </button>
                    </div>
                    {errors.password?.length > 0 && (
                        <div className={f.errorText}>
                            {errors.password[0]}
                        </div>
                    )}
                    <div className={`${f.inputHolder} ${f.passwordWrapper}`}>
                        <label className={f.label}>Повторите пароль</label>
                        <input
                            type={showPasswords ? "text" : "password"}
                            className={`${f.field} ${f.fieldPassword}`}
                            name="password2"
                            required
                            disabled={isSubmitting}
                        />

                        <button
                            type="button"
                            onClick={() => setShowPasswords(!showPasswords)}
                            disabled={isSubmitting}
                            className={f.togglePasswordBtn}
                        >
                            {showPasswords
                                ? <Eye size={18} strokeWidth={2.5} color="#2A3E3C" />
                                : <EyeClosed size={18} strokeWidth={2.5} color="#2A3E3C" />
                            }
                        </button>
                    </div>

                </>}

                <div className={f.buttonHolder}>
                    <button className={f.button} type="submit">
                        {sent ? "Подтвердить" : "Выслать код"}
                    </button>
                    <button className={f.button} type="button" onClick={() => { onCloseClick('navigate') }}>
                        Отмена
                    </button>
                </div>
            </form>
            <Toast message={error} onClose={() => setError("")}/></>
    )
}
