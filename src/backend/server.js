const express = require("express");
const app = express();
exports.app = app;
const bodyParser = require("body-parser");

const cookieParser = require("cookie-parser");
import { adminRouter } from "./adminRouter";
import { pool } from "./connections";
import path from "path";
import { emailService } from "./sendEmail";
import { sessionParser } from "./sessionParser";
import { authRouter } from "./authRouter";
const multer = require("multer");
const upload = multer();

require("./sendEmail");

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(sessionParser);
app.use("/api/admin", adminRouter);
app.use("/api", authRouter);

app.get("/api/categories", async function (req, res) {
  try {
    const result = await pool.query(
      "SELECT category_name, category_id from category order by category_name",
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// app.get("/api/category/image/:id", async function (req, res) {
//   try {
//     const param = req.params.id;
//     const result = await pool.query(
//       "select category_picture from category where category_id= $1",
//       [param],
//     );
//     res.status(200).contentType("image/jpeg");
//     res.send(result.rows[0].category_picture);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

app.get("/api/category/:id", async function (req, res) {
  try {
    const param = req.params.id;
    const result = await pool.query(
      "select category_name from category where category_id=$1",
      [param],
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/category/:id/items", async function (req, res) {
  try {
    const param = req.params.id;
    const result = await pool.query(
      "select item_id, item_name, price, length, width, height from item where category_id=$1 and removed=$2 order by item_name desc",
      [param, false],
    );
    if (req.user?.user_id) {
      const liked = (
        await pool.query("select item_id from favourites where user_id=$1", [
          req.user.user_id,
        ])
      ).rows.map((row) => row.item_id); //возвращает массив объектов, берём только числа
      //liked = массив ID товаров, которые пользователь добавил в избранное
      for (const row of result.rows) {
        //result - все товары вообще
        row.liked = liked.includes(row.item_id); //Каждой строке-товару добавляется значение наличия в избранном или нет
      }
    }
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// app.get("/api/item/image/:id", async function (req, res) {
//   try {
//     const param = req.params.id;
//     const result = await pool.query(
//       "select item_picture from item where item_id= $1",
//       [param],
//     );
//     res.status(200).contentType("image/jpeg");
//     res.send(result.rows[0].item_picture);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

app.get("/api/item/:id", async function (req, res) {
  try {
    const param = req.params.id;
    const result = await pool.query(
      "select item_id,item_name,article,length,width,height,price,description,quantity, show, removed from item where item_id=$1 ",
      [param],
    );
    const item = result.rows[0];
    if (req.user?.user_id) {
      const likedResult = await pool.query(
        "select item_id from favourites where user_id=$1 and item_id=$2",
        [req.user.user_id, param],
      );
      item.liked = likedResult.rows.length > 0;
    } else {
      item.liked = false;
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/showed_items", async function (req, res) {
  try {
    const result = await pool.query(
      "select item_id,item_name,article,length,width,height,price,description,quantity from item where show=$1 and removed=$2",
      [true, false],
    );
    if (req.user?.user_id) {
      const liked = (
        await pool.query("select item_id from favourites where user_id=$1", [
          req.user.user_id,
        ])
      ).rows.map((row) => row.item_id); //возвращает массив объектов, берём только числа
      //liked = массив ID товаров, которые пользователь добавил в избранное
      for (const row of result.rows) {
        //result - все товары вообще
        row.liked = liked.includes(row.item_id); //Каждой строке-товару добавляется значение наличия в избранном или нет
      }
    }
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/favourites", upload.none(), async function (req, res) {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Не авторизован" });
      return;
    }
    const { item_id, liked } = req.body;
    const findItem = await pool.query(
      "select * from favourites where item_id=$1 and user_id=$2 ",
      [item_id, req.user.user_id],
    );
    if (!findItem.rowCount && liked === "true") {
      //если товара нет а его надо лайкнуть
      await pool.query(
        "insert into favourites(item_id,user_id) values ($1,$2)",
        [item_id, req.user.user_id],
      );
    }
    if (findItem.rowCount && liked === "false") {
      //если товар есть, а его надо дизлайкнуть
      await pool.query(
        "delete from favourites where item_id=$1 and user_id=$2",
        [item_id, req.user.user_id],
      );
      //другие случаи не обрабатываются потому что при них не нужно ничего делать
    }
    res.status(200).json({});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/liked_items", async function (req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Не авторизован",
      });
    }
    const userId = req.user?.user_id;
    const result = await pool.query(
      `SELECT 
        i.item_id,
        i.item_name,
        i.article,
        i.length,
        i.width,
        i.height,
        i.price,
        i.description,
        i.quantity,
        i.show,
        i.category_id,
        i.removed,
        true as liked
       FROM favourites f
       JOIN item i ON f.item_id = i.item_id
       WHERE f.user_id = $1`,
      [userId],
    );

    res.status(200).json({ favourites: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/order/:id", upload.none(), async function (req, res) {
  const { preferred_datetime, user_name, phone } = req.body;
  const param = req.params.id;
  if (!req.user) {
    return res.status(401).json({
      error: "Не авторизован",
    });
  }
  const userId = req.user?.user_id;
  const errors = [];

  try {
    // --- ВАЛИДАЦИЯ ПОЛЕЙ ---
    // Имя
    !user_name && errors.push("Имя обязательно");
    user_name?.length < 2 && errors.push("Имя должно быть не менее 2 символов");
    user_name?.length > 50 &&
      errors.push("Имя должно быть не более 50 символов");
    user_name &&
      !/^[а-яА-ЯёЁ\s\-]+$/.test(user_name) &&
      errors.push("Только кириллица, пробелы и дефисы");
    user_name &&
      (user_name.startsWith("-") || user_name.startsWith(" ")) &&
      errors.push("Имя не должно начинаться с пробела или дефиса");
    user_name &&
      (user_name.endsWith("-") || user_name.endsWith(" ")) &&
      errors.push("Имя не должно заканчиваться пробелом или дефисом");
    user_name &&
      /\s\s+/.test(user_name) &&
      errors.push("Имя не должно содержать несколько пробелов подряд");

    // Телефон
    !phone && errors.push("Телефон обязателен");
    phone &&
      !/^[+\s\-\(\)0-9]+$/.test(phone) &&
      errors.push(
        "Номер может содержать только цифры, пробелы, скобки, дефисы и знак +",
      );
    phone &&
      !/^(\+7|8)/.test(phone) &&
      errors.push("Номер должен начинаться с +7 или 8");
    const digitsOnly = phone?.replace(/\D/g, "");
    digitsOnly?.length !== 11 && errors.push("Номер должен содержать 11 цифр");

    // Время
    !preferred_datetime && errors.push("Дата и время обязательны");

    if (preferred_datetime) {
      const selectedDate = new Date(new Date(preferred_datetime).getTime() + (3 * 3600000));
      const now = new Date(new Date().getTime() + (3 * 3600000));

      // Проверка на корректную дату
      isNaN(selectedDate.getTime()) && errors.push("Некорректный формат даты");

      if (!isNaN(selectedDate.getTime())) {
        // Текущее время + 30 минут
        const minDateTime = new Date(now.getTime() + 30 * 60000);
        // Текущая дата + две недели
        const maxDateTime = new Date(now.getTime() + 14 * 24 * 60 * 60000);

        // Часы и минуты выбранного времени
        const selectedHours = selectedDate.getHours();
        const selectedMinutes = selectedDate.getMinutes();

        // Проверка на сегодняшнюю дату
        const isToday = selectedDate.toDateString() === now.toDateString();

        // Если выбрана сегодняшняя дата
        if (isToday) {
          // Проверяем, не поздно ли уже (после 16:30)
          const currentHours = now.getHours();
          const currentMinutes = now.getMinutes();
          const currentTotalMinutes = currentHours * 60 + currentMinutes;
          const thresholdTotalMinutes = 16 * 60 + 30; // 16:30

          // Если сейчас больше или равно 16:30
          if (currentTotalMinutes >= thresholdTotalMinutes) {
            errors.push(
              "Сегодня уже нельзя оформить заказ, выберите завтрашний день",
            );
          } else {
            // Если ещё можно выбрать сегодня, проверяем стандартные ограничения
            selectedDate < minDateTime &&
              errors.push(
                "Время должно быть не менее чем через 30 минут от текущего момента",
              );
          }
        } else {
          // Для других дней просто проверяем минимум (но не сегодня)
          selectedDate < minDateTime &&
            errors.push(
              "Время должно быть не менее чем через 30 минут от текущего момента",
            );
        }

        // Общие проверки для любой даты
        selectedDate > maxDateTime &&
          errors.push("Дата не должна превышать две недели от текущей");
        (selectedHours < 10 || selectedHours > 17) &&
          errors.push("Время должно быть с 10:00 до 17:00");

        // Дополнительная проверка: если время 17:00 и позже - ошибка
        selectedHours === 17 &&
          selectedMinutes > 0 &&
          errors.push("Время должно быть до 17:00");
      }
    }

    // Если есть ошибки, возвращаем их
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    //ОСНОВНАЯ ЛОГИКА
    await pool.query("SET TIME ZONE 'Europe/Moscow'");

    const { rows } = await pool.query(
      "SELECT price FROM item WHERE item_id = $1",
      [param],
    );

    !rows[0] && errors.push("Товар не найден");

    if (errors.length > 0) {
      return res.status(404).json({ errors });
    }

    const price = rows[0].price;

    const result = await pool.query(
      `INSERT INTO orders (user_id, item_id, date, recall_date, price, status, user_name, phone) 
       VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7) RETURNING *`,
      [userId, param, preferred_datetime, price, "Оформлен", user_name, phone],
    );
    const orderData = {
      order_id: result.rows[0].order_id,
      created_at: result.rows[0].date,
    };

    emailService.sendNewOrderNotification(orderData).catch(console.error);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/bids", async function (req, res) {
  if (!req.user) {
    return res.status(401).json({
      error: "Не авторизован",
    });
  }
  const userId = req.user?.user_id;
  try {
    const result = await pool.query(
      `SELECT o.order_id, o.date, u.email, o.user_name, o.item_id, i.article, o.price, o.recall_date, o.phone, o.status 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.user_id 
      LEFT JOIN item i ON o.item_id = i.item_id 
      WHERE o.user_id =$1
      ORDER BY o.date DESC `,
      [userId],
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use(express.static("static"));

app.use("/api/item/image", express.static("/var/images/items"));
app.use("/api/category/image", express.static("/var/images/categories"));

app.get("/*splat", (req, res) => {
  res.sendFile(path.resolve("./static", "index.html"));
});

app.listen(3001);
