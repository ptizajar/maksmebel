import React, { useEffect, useState } from "react";
import styles from "../css/.module/cookieBanner.module.css"

const COOKIE_KEY = "cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);

  const initMetrika = () => {
    if (window.ym) {
      window.ym(109088572, "init", {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true,
      });
    }
  };

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);

    if (consent === "accepted") {
      initMetrika();
    } else if (!consent) {
      setVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    setHidden(true);

    setTimeout(() => {
      localStorage.setItem(COOKIE_KEY, "accepted");
      initMetrika();
      setVisible(false);
    }, 250);
  };

  const declineCookies = () => {
    setHidden(true);

    setTimeout(() => {
      localStorage.setItem(COOKIE_KEY, "declined");
      setVisible(false);
    }, 250);
  };

  if (!visible) return null;

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.banner} ${hidden ? styles.hidden : ""}`}>
        <p className={styles.text}>
          Мы используем cookies для аналитики и улучшения работы сайта.{" "}
          Подробнее в{" "}
          <a
            href="/public/privacy-policy.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Политике конфиденциальности
          </a>{" "}
          и{" "}
          <a
            href="/public/consent.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Согласии на обработку ПДн
          </a>.
        </p>

        <div className={styles.buttons}>
          <button
            onClick={declineCookies}
            className={`${styles.button} ${styles.decline}`}
          >
            Отклонить
          </button>

          <button
            onClick={acceptCookies}
            className={`${styles.button} ${styles.accept}`}
          >
            Принять
          </button>
        </div>
      </div>
    </div>
  );
}