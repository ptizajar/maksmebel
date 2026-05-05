
import React from "react";
import { Phone, Mail, Clock, MapPin } from "lucide-react"; // Иконки
import f from "../css/.module/footer.module.css";

export function Footer() {
  return (
    <div className={f.footer}>
      {/* Контейнер для двух столбцов, расположенных по горизонтали */}
      <div className={f.columnsWrapper}>
        {/* Первый столбец */}
        <div className={f.column}>
          <div className={f.contactItem}>
            <Phone className={f.icon} />
            <span>+7 (123) 456-78-90</span>
          </div>
          <div className={f.contactItem}>
            <Mail className={f.icon} />
            <span>maksmebel0@gmail.com</span>
          </div>
          <div className={f.contactItem}>
            <Clock className={f.icon} />
            <span>Пн-Вс: 10:00 - 17:00</span>
          </div>
          <div className={f.contactItem}>
            <MapPin className={f.icon} />
            <span>г. Ростов-на-Дону, ул. Извилистая 7</span>
          </div>
        </div>

        {/* Второй столбец */}
        <div className={f.column}>
          <a href="/public/consent.pdf" target="_blank" rel="noopener noreferrer" >Согласие на обработку ПДн</a>
          <a href="/public/privacy-policy.pdf" target="_blank" rel="noopener noreferrer" >Политика конфиденциальности</a>
          <span>Ⓒ 2026, ООО "МАКС-МЕБЕЛЬ"</span>
        </div>
      </div>
    </div>
  );
}