import React, { useState } from "react"
import f from "../css/.module/form.module.css"
import { showDialog } from "./Dialog";
import { LoginForm } from "./LoginForm";
import { useDispatch } from "react-redux";
import { setUser } from "../store";
import { useValidation } from "../validation/useValidation";
import { Eye, EyeClosed } from "lucide-react";
import { Toast } from "./Toast";
import t from "../css/.module/toast.module.css";
import InputMask from "react-input-mask";

export function RegistrationForm({ onCloseClick }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isConsentChecked, setIsConsentChecked] = useState(false);
    const dispatch = useDispatch();

    const { errors, checkField, checkForm, clearErrors } = useValidation('registration');

    async function save(e) {
        e.preventDefault();
        const formData = new FormData(registrationForm);

        const missMatch = formData.get("password") !== formData.get("password2");
        if (missMatch) {
            setError("Пароли не совпадают");
            setTimeout(() => setError(""), 5000);
            return;
        }

        const validationData = {
            user_name: formData.get('user_name') || '',
            phone: formData.get('phone') || '',
            password: formData.get('password') || '',
            email: formData.get('email') || ''
        };

        const isValid = checkForm(validationData);

        if (!isValid) {
            return;
        }

        setIsSubmitting(true);


        const res = await fetch(`/api/registrate`, {
            method: 'POST',
            body: new FormData(registrationForm)

        });
        if (!res.ok) {
            const err = await res.json();
            setError(err.error);
            setTimeout(() => setError(""), 5000);
            setIsSubmitting(false)
            return;
        }
        const result = await res.json();

        dispatch(setUser(result));
        clearErrors();
        setIsSubmitting(false);
        onCloseClick();

    }

    function switchForm(newform) {
        onCloseClick();
        showDialog(newform);
    }
    return (
        <>
            <form className={f.form} onSubmit={save} id="registrationForm" method="POST" encType="multipart/form-data">
                <p className={f.title}>Зарегистрироваться</p>
                <div className={f.inputHolder}>
                    <label className={`${f.label} ${f.labelRequired}`}>Имя</label>
                    <input
                        type="text"
                        className={f.field}
                        name="user_name"
                        onChange={(e) => checkField('user_name', e.target.value)}
                        onBlur={(e) => checkField('user_name', e.target.value)}
                        required
                        disabled={isSubmitting} />
                </div>
                {errors.user_name?.length > 0 && (
                    <div className={f.errorText}>
                        {errors.user_name[0]}
                    </div>
                )}
                <div className={f.inputHolder}>
                    <label className={f.label}>Компания</label>
                    <input
                        type="text"
                        className={f.field}
                        name="company"
                        disabled={isSubmitting} />
                </div>
                <div className={f.inputHolder}>
                    <label className={`${f.label} ${f.labelRequired}`}>Email</label>
                    <input
                        type="text"
                        className={f.field}
                        name="email"
                        onChange={(e) => checkField('email', e.target.value)}
                        onBlur={(e) => checkField('email', e.target.value)}
                        required
                        disabled={isSubmitting} />
                </div>
                {errors.email?.length > 0 && (
                    <div className={f.errorText}>
                        {errors.email[0]}
                    </div>
                )}
                <div className={f.inputHolder}>
                    <label className={`${f.label} ${f.labelRequired}`}>Номер телефона</label>
                    <InputMask
                        mask="+7 (999) 999-99-99"
                        alwaysShowMask={true}
                        maskChar="_"
                        disabled={isSubmitting}
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
                <div className={`${f.inputHolder} ${f.passwordWrapper}`}>
                    <label className={`${f.label} ${f.labelRequired}`}>Пароль</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        className={`${f.field} ${f.fieldPassword}`}
                        name="password"
                        onChange={(e) => checkField('password', e.target.value)}
                        onBlur={(e) => checkField('password', e.target.value)}
                        required
                        disabled={isSubmitting} />

                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSubmitting}
                        className={f.togglePasswordBtn}
                        aria-label={showPassword ? "Показать пароль" : "Скрыть пароль"}
                    >
                        {showPassword ?
                            <Eye size={18} strokeWidth={2.5} /> :
                            <EyeClosed size={18} strokeWidth={2.5} />
                        }
                    </button>
                </div>
                {errors.password?.length > 0 && (
                    <div className={f.errorText}>
                        {errors.password[0]}
                    </div>
                )}

                <div className={`${f.inputHolder} ${f.passwordWrapper}`}>
                    <label className={`${f.label} ${f.labelRequired}`}>Повторите пароль</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        className={`${f.field} ${f.fieldPassword}`}
                        name="password2"
                        required
                        disabled={isSubmitting} />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSubmitting}
                        className={f.togglePasswordBtn}
                        aria-label={showPassword ? "Показать пароль" : "Скрыть пароль"}
                    >
                        {showPassword ?
                            <Eye size={18} strokeWidth={2.5} /> :
                            <EyeClosed size={18} strokeWidth={2.5} />
                        }
                    </button>
                </div>

                <div className={f.checkboxConsent}>
                    <input
                        type="checkbox"
                        id="consent"
                        checked={isConsentChecked}
                        onChange={(e) => setIsConsentChecked(e.target.checked)}
                        disabled={isSubmitting}
                        required
                    />
                    <label className={`${f.label} ${f.consentText}`} htmlFor="consent">
                        Я соглашаюсь с{" "}
                        <a href="/public/privacy-policy.pdf" target="_blank" rel="noopener noreferrer" className={f.linkField}>
                            Политикой конфиденциальности
                        </a>
                        {" "}и{" "}
                        <a href="/public/consent.pdf" target="_blank" rel="noopener noreferrer" className={f.linkField}>
                            Согласием на обработку персональных данных
                        </a>
                    </label>
                </div>

                <div className={f.buttonHolder}>
                    <button className={f.button} type="submit" disabled={isSubmitting || !isConsentChecked}>
                        ОК
                    </button>
                    <button
                        className={f.button}
                        onClick={() => {
                            clearErrors();
                            onCloseClick()
                        }}
                        disabled={isSubmitting}>
                        Отмена
                    </button>
                </div>
                <p className={`${f.label} ${f.marginTop10}`}>Уже есть аккаунт?</p>
                <div className={`${f.buttonHolder} ${f.buttonCenter}`}>
                    <button
                        className={`${f.button} ${f.buttonWide}`}
                        onClick={() => {
                            clearErrors();
                            switchForm(LoginForm)
                        }}>
                        Войти
                    </button>
                </div>


            </form>
            <Toast message={error} onClose={() => setError("")} /></>
    )
}
