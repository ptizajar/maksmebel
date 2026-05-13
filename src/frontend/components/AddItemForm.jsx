import React, { useEffect, useState } from "react"
import f from "../css/.module/form.module.css"
import { useValidation } from "../validation/useValidation";
import t from "../css/.module/toast.module.css";
import { Toast } from "./Toast";

export function AddItemForm({ onCloseClick, param }) {//получает из Dialog
    const [isSubmitting, setIsSubmitting] = useState(false);//проверять находится ли форма в процессе отправки на сервер
    const [error, setError] = useState("");
    const { errors, checkField, checkForm, clearErrors } = useValidation('item');
    const [item, setItem] = useState(null);
    const [preview, setPreview] = useState(null);

    // const handleFieldChange = (e, fieldType) => {
    //     checkField(fieldType, e.target.value);
    // };
    // Очистка памяти от временной ссылки при размонтировании
    useEffect(() => {
        return () => { if (preview) URL.revokeObjectURL(preview); };
    }, [preview]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Создаем временную ссылку на выбранный файл
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
        }
    };

    async function loadItem() {
        const res = await fetch(`/api/item/${param.item_id}`);
        if (!res.ok) {
            const err = await res.json();
            setError(err.error);
            setTimeout(() => setError(""), 5000);
            setIsSubmitting(false)
            return;
        }
        const data = await res.json();
        setError("");
        setItem(data)
    }

    useEffect(() => {
        if (param.item_id) {
            loadItem()
        }
    }, []);

    async function save(e) {
        e.preventDefault();
        setError("");
        const formData = new FormData(e.target);

        const validationData = {
            item_article: formData.get('article') || '',
            item_name: formData.get('item_name') || '',
            item_description: formData.get('description') || ''
        };

        const isValid = checkForm(validationData);

        if (!isValid) {
            return;
        }

        setIsSubmitting(true);

        const res = await fetch(`/api/admin/item`, {
            method: 'PUT',
            body: formData
        });
        if (!res.ok) {
            const err = await res.json();
            setError(err.error);
            setIsSubmitting(false)
            return;
        }

        await res.json();

        clearErrors();
        onCloseClick();
    }
    // Определяем, какую картинку показывать: новую выбранную, старую или ничего
    const getBackgroundImage = () => {
        if (preview) return `url('${preview}')`;
        if (param?.item_id) return `url('/api/item/image/${param.item_id}')`;
        return 'none';
    };

    const style = { backgroundImage: getBackgroundImage() };

    return (
        <>
            <form className={`${f.form} ${f.wideForm}`} onSubmit={save} id="addItemForm" method="PUT" encType="multipart/form-data">
                <p className={f.title}>{param.item_id ? "Редактировать товар" : "Добавить товар"}</p>
                <div className={f.twoColumns}>
                    <div className={f.column}>
                        <div className={`${f.inputHolder} ${f.noMarginTop}`}>
                            <label className={`${f.label} ${f.labelRequired}`}>Артикул</label>
                            <input
                                type="text"
                                className={f.field}
                                name="article"
                                required
                                defaultValue={item?.article}
                                onChange={(e) => checkField('item_article', e.target.value)}
                                onBlur={(e) => checkField('item_article', e.target.value)}
                                disabled={isSubmitting} />
                        </div>
                        {errors.item_article?.length > 0 && (
                            <div className={f.errorText}>
                                {errors.item_article[0]}

                            </div>
                        )}
                        <div className={f.inputHolder}>
                            <label className={`${f.label} ${f.labelRequired}`}>Название</label>
                            <input
                                type="text"
                                 className={f.field}
                                name="item_name"
                                required
                                defaultValue={item?.item_name}
                                onChange={(e) => checkField('item_name', e.target.value)}
                                onBlur={(e) => checkField('item_name', e.target.value)}
                                disabled={isSubmitting} />
                        </div>
                        {errors.item_name?.length > 0 && (
                            <div className={f.errorText}>
                                {errors.item_name[0]}

                            </div>
                        )}
                        <div className={f.inputHolder}>
                            <label className={`${f.label} ${f.labelRequired}`}>Длина</label>
                            <input
                                type="number"
                                pattern="[0-9]*"
                                className={f.field}
                                name="length"
                                required
                                defaultValue={item?.length}
                                disabled={isSubmitting} />
                        </div>
                        <div className={f.inputHolder}>
                            <label className={`${f.label} ${f.labelRequired}`}>Ширина</label>
                            <input
                                type="number"
                                pattern="[0-9]*"
                                className={f.field}
                                name="width"
                                required
                                defaultValue={item?.width}
                                disabled={isSubmitting} />
                        </div>
                        <div className={f.imageHolder}>
                            <label className={`${f.label} ${f.labelRequired}`}>Изображение</label>
                            <div className={f.image} style={style}>
                                <input
                                    className={f.fileInput}
                                    type="file"
                                    name="item_image"
                                    accept="image/*"
                                    required={!param}
                                    onChange={handleImageChange} />
                            </div>
                        </div>
                    </div>
                    <div className={f.column}>
                        <div className={`${f.inputHolder} ${f.noMarginTop}`}>
                            <label className={`${f.label} ${f.labelRequired}`}>Высота</label>
                            <input
                                type="number"
                                pattern="[0-9]*"
                                className={f.field}
                                name="height"
                                required
                                defaultValue={item?.height}
                                disabled={isSubmitting} />
                        </div>
                        <div className={f.inputHolder}>
                            <label className={`${f.label} ${f.labelRequired}`}>Заказ от</label>
                            <input
                                type="number"
                                pattern="[0-9]*"
                                className={f.field}
                                name="quantity"
                                required
                                defaultValue={item?.quantity}
                                disabled={isSubmitting} />
                        </div>
                        <div className={f.inputHolder}>
                            <label className={`${f.label} ${f.labelRequired}`}>Цена</label>
                            <input
                                type="number"
                                pattern="[0-9]*"
                                className={f.field}
                                name="price"
                                required
                                defaultValue={item?.price}
                                disabled={isSubmitting} />
                        </div>


                        <div className={f.inputHolder}>
                            <label className={f.label}>Описание</label>
                            <textarea
                                type="text"
                                className={f.field}
                                name="description"
                                defaultValue={item?.description}
                                onChange={(e) => checkField('item_description', e.target.value)}
                                onBlur={(e) => checkField('item_description', e.target.value)}
                                disabled={isSubmitting} />
                        </div>
                        {errors.item_description?.length > 0 && (
                            <div className={f.errorText}>
                                {errors.item_description[0]}
                            </div>
                        )}


                        <div className={f.checkboxInGrid}>
                            <label className={f.label} htmlFor="checkbox">Хит продаж</label>
                            <input
                                id="checkbox"
                                type="checkbox"
                                name="show"
                                defaultChecked={item?.show}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                </div>
           

                <input type="hidden" name="item_id" value={param.item_id} />
                <input type="hidden" name="category_id" value={param.category_id} />

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
                            onCloseClick()
                        }}
                        disabled={isSubmitting}
                    >
                        Отмена
                    </button>
                </div>
            </form >
             <Toast message={error} onClose={() => setError("")}/></>
    );
}
