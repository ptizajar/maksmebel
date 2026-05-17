import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const location = useLocation();

  useLayoutEffect(() => {
    // отключаем автоматическое восстановление браузером
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // скроллим ВСЁ наверх
    document.documentElement.scrollTo(0, 0);
    document.body.scrollTo(0, 0);
    window.scrollTo(0, 0);

  }, [location.pathname]);

  return null;
}