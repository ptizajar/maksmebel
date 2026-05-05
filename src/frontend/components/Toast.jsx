import React, { useEffect, useState } from "react";
import t from "../css/.module/toast.module.css"
const TOAST_DURATION = 5000; 

export function Toast  ({ message, onClose }) {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (!message) return;

        const timer = setTimeout(() => {
            handleClose();
        }, TOAST_DURATION);

        return () => clearTimeout(timer);
    }, [message]);

    const handleClose = () => {
        setIsClosing(true);

        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    if (!message) return null;

    return (
        <div className={`${t.toastNotification} ${isClosing ? t.fadeOut : ""}`}>
            <div className={t.toastContent}>
                <span className={t.toastMessage}>{message}</span>
                <button onClick={handleClose} className={t.toastClose}>×</button>
            </div>
            <div
                className={t.toastProgress}
                style={{ animationDuration: `${TOAST_DURATION}ms` }}
            />
        </div>
    );
};
