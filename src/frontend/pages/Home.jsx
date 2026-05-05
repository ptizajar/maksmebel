import React from "react";
import { useState } from "react";
import { ItemCard } from "../components/ItemCard";
import { useEffect } from "react";
import l from "../css/.module/layout.module.css";
import h from "../css/.module/home.module.css";
import i from "../css/.module/itemCard.module.css"
import t from "../css/.module/toast.module.css";
import { Toast } from "../components/Toast";
import { MapPin } from "lucide-react";

export function Home() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  async function loadItems() {
    const res = await fetch(`/api/showed_items`);
    if (!res.ok) {
      const err = await res.json();
      setError(err.error);
      setTimeout(() => setError(""), 5000);
      return;
    }
    const data = await res.json();
    setItems(data);
  }
  useEffect(() => { loadItems() }, []);
  return (
    <>
      <div className={h.banner}>
        <p className={h.line}>Максимум пространства</p>
        <p className={`${h.line} ${h.indent}`}>Максимум идей</p>
      </div>

      <h1 className={l.title}>Хиты продаж</h1>
      <div className={i.cardHolder}>
        {items.map(
          (item) =>
            !item.show && (
              <div className={i.cardWrapper} key={item.item_id}>
                <ItemCard
                  key={item.item_id}
                  item_id={item.item_id}
                  name={item.item_name}
                  price={item.price}
                  width={Math.round(item.width)}
                  height={Math.round(item.height)}
                  length={Math.round(item.length)}
                  liked={item.liked}
                ></ItemCard>
              </div>
            )
        )}
      </div>
      <h1 className={l.title}>О нас</h1>
      <div className={h.infoHolder}>
        <div className={h.info}>
          <strong>МАКС-МЕБЕЛЬ</strong> занимается оптовой продажей офисной мебели, являясь партнером ведущих компаний в сфере производства и поставки мебели для бизнеса. Мы предлагаем своим клиентам широкий ассортимент надежной и эргономичной продукции по выгодным ценам.
          В нашем каталоге  вы сможете подобрать все необходимое для оснащения офиса: рабочие и компьютерные кресла, столы, шкафы, системы хранения, а также комплексные решения для переговорных комнат и ресепшен.
        </div>

        <div className={h.adressInfo}>
          <div className={h.adress}>
            <MapPin size={24} strokeWidth={2} color="#2A3E3C"></MapPin>
            г. Ростов-на-Дону, ул. Извилистая 7
          </div>
          <div className={h.mapHolder}>
            <iframe src="https://yandex.ru/map-widget/v1/?ll=39.633967%2C47.202894&mode=whatshere&whatshere%5Bpoint%5D=39.630200%2C47.200736&whatshere%5Bzoom%5D=17&z=15"
              style={{ position: "relative", width: "100%", height: "100%" }}>
            </iframe>
          </div>
        </div>
      </div>
      <Toast message={error} onClose={() => setError("")}/>
    </>
  );
}


