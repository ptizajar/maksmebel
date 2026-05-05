const express = require("express");
const multer = require("multer");
const upload = multer();
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
export const authRouter = express.Router();
import { pool, redisConnection, client } from "./connections";
import { sessionParser } from "./sessionParser";
import { emailService } from "./sendEmail";

require("./sendEmail");

authRouter.use(cookieParser());
authRouter.use(sessionParser);
authRouter.use(bodyParser.urlencoded({ extended: true }));

function hashPasswordMD5(password) {
  const hash = crypto.createHash("md5").update(password).digest("hex");
  return hash;
}

authRouter.get("/refresh-session", async function (req, res) {
  return res.status(200).json({ user: req.user });
});

authRouter.post("/registrate", upload.none(), async function (req, res) {
  const { user_name, phone, email, password, company } = req.body;
  const errors = [];
  try {
    // Имя
    !user_name && errors.push("Имя обязательно");
    user_name?.trim().length < 2 &&
      errors.push("Имя должно быть не менее 2 символов");
    user_name?.trim().length > 50 &&
      errors.push("Имя должно быть не более 50 символов");
    user_name &&
      !/^[а-яА-ЯёЁ\s\-]+$/.test(user_name.trim()) &&
      errors.push("Имя может содержать только кириллицу, пробелы и дефисы");

    // Телефон
    !phone && errors.push("Телефон обязателен");
    phone &&
      !/^(\+7|8)/.test(phone) &&
      errors.push("Номер должен начинаться с +7 или 8");
    const digitsOnly = phone?.replace(/\D/g, "");
    digitsOnly?.length !== 11 && errors.push("Номер должен содержать 11 цифр");
    digitsOnly &&
      !/^[78]/.test(digitsOnly) &&
      errors.push("Первая цифра номера должна быть 7 или 8");

    // Валидация email
    !email && errors.push("Email обязателен");
    email?.trim().length < 5 &&
      errors.push("Email должен быть не менее 5 символов");
    email?.trim().length > 100 &&
      errors.push("Email должен быть не более 100 символов");
    email &&
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim()) &&
      errors.push("Введите корректный email адрес");
    email &&
      email.trim().includes("..") &&
      errors.push("Email не может содержать две точки подряд");
    email &&
      (() => {
        const localPart = email.trim().split("@")[0];
        return (
          localPart && (localPart.startsWith(".") || localPart.endsWith("."))
        );
      })() &&
      errors.push(
        "Локальная часть email не может начинаться или заканчиваться точкой",
      );

    // Пароль
    !password && errors.push("Пароль обязателен");
    password?.length < 6 &&
      errors.push("Пароль должен быть не менее 6 символов");
    password?.length > 50 &&
      errors.push("Пароль должен быть не более 50 символов");
    password &&
      /\s/.test(password) &&
      errors.push("Пароль не должен содержать пробелы");
    password &&
      !/[A-Z]/.test(password) &&
      errors.push("Пароль должен содержать хотя бы одну заглавную букву");
    password &&
      !/[0-9]/.test(password) &&
      errors.push("Пароль должен содержать хотя бы одну цифру");
    password &&
      !/[\W_]/.test(password) &&
      errors.push("Пароль должен содержать хотя бы один специальный символ");
    password &&
      /[а-яА-ЯёЁ]/.test(password) &&
      errors.push("Пароль должен содержать только латиницу");

    // Если есть ошибки валидации - сразу возвращаем
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(". ") });
    }

    // ПРОВЕРКА УНИКАЛЬНОСТИ
    const findEmail = await pool.query("select * from users where email=$1", [
      email,
    ]);
    if (findEmail.rowCount > 0) {
      return res
        .status(400)
        .json({ error: "Пользователь с такой почтой уже существует" });
    } else {
      const result = await pool.query(
        "INSERT INTO users ( email, password, user_name, phone, is_admin, company) values ($1, $2, $3, $4, $5, $6)  RETURNING user_id, user_name, phone, is_admin, email, company",
        [
          email,
          hashPasswordMD5(password),
          user_name,
          phone.trim(),
          false,
          company,
        ],
      );
      const cookie = crypto.randomBytes(64).toString("hex");
      const currentUser = result.rows[0];

      await redisConnection;
      const sessionTTL = 24 * 60 * 60; // 24 часа в секундах
      await client.setEx(cookie, sessionTTL, JSON.stringify(currentUser));
      res
        .status(200)
        .cookie("sessionId", cookie, {
          httpOnly: true, //защита от xss атак
          sameSite: "strict", // Защита от CSRF
          maxAge: sessionTTL * 1000, // Конвертируем в миллисекунды
        })
        .json(currentUser);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const tries = new Map(); //key-email,value-array of tries by time

authRouter.post("/login", upload.none(), async function (req, res) {
  const { email, password } = req.body;
  const currentTries = tries.get(email) || [];
  if (currentTries.length === 3) {
    const timeGone = Date.now() - currentTries[2]; //время которое прошло с первой попытки из трёх
    if (timeGone < 5 * 60 * 1000) {
      res.status(429).json({ error: "Слишком много попыток" });
      return;
    }
  }
  try {
    const findEmail = await pool.query("select * from users where email=$1", [
      email,
    ]);
    if (findEmail.rowCount === 0) {
      tries.set(email, [Date.now(), ...(tries.get(email) || []).slice(0, 2)]); //добавляем в начало дату, копируя в хвост что было до этого(первые два элемента) или пустой массив если ничего не было
      res.status(401).json({ error: "Неверный логин или пароль" });
      return;
    }
    const savedPassword = findEmail.rows[0].password;
    const givenPassword = hashPasswordMD5(password);
    if (savedPassword !== givenPassword) {
      tries.set(email, [Date.now(), ...(tries.get(email) || []).slice(0, 2)]);
      res.status(401).json({ error: "Неверный email или пароль" });
      return;
    }
    const cookie = crypto.randomBytes(64).toString("base64");
    const currentUser = findEmail.rows[0];
    const sessionTTL = 24 * 60 * 60; // 24 часа в секундах
    const testSessionTTl = 10;
    await redisConnection;
    await client.setEx(cookie, sessionTTL, JSON.stringify(currentUser));
    res
      .status(200)
      .cookie("sessionId", cookie, {
        httpOnly: true, //защита от xss атак
        sameSite: "strict", // Защита от CSRF
        maxAge: sessionTTL * 1000, // Конвертируем в миллисекунды
      })
      .json(currentUser);

    tries.delete(email);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

authRouter.post("/logout", async function (req, res) {
  try {
    await redisConnection;
    const sessionId = req.cookies.sessionId;
    await client.del(sessionId);
    res
      .status(200)
      .clearCookie("sessionId", {
        httpOnly: true, //защита от xss атак
        sameSite: "strict", // Защита от CSRF
      })
      .json({});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

authRouter.get("/user_data", async function (req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Не авторизован",
      });
    }
    const userId = req.user?.user_id;
    const result = await pool.query(
      "select user_name, phone, email, company from users where user_id = $1",
      [userId],
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

authRouter.put("/edit_user", upload.none(), async function (req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Не авторизован",
      });
    }
    const userId = req.user?.user_id;
    const newName = req.body.user_name;
    const newPhone = req.body.phone;
    const company = req.body.company;
    const errors = [];

    // Имя
    !user_name && errors.push("Имя обязательно");
    user_name?.trim().length < 2 &&
      errors.push("Имя должно быть не менее 2 символов");
    user_name?.trim().length > 50 &&
      errors.push("Имя должно быть не более 50 символов");
    user_name &&
      !/^[а-яА-ЯёЁ\s\-]+$/.test(user_name.trim()) &&
      errors.push("Имя может содержать только кириллицу, пробелы и дефисы");

    // Телефон
    !phone && errors.push("Телефон обязателен");
    phone &&
      !/^(\+7|8)/.test(phone) &&
      errors.push("Номер должен начинаться с +7 или 8");
    const digitsOnly = phone?.replace(/\D/g, "");
    digitsOnly?.length !== 11 && errors.push("Номер должен содержать 11 цифр");
    digitsOnly &&
      !/^[78]/.test(digitsOnly) &&
      errors.push("Первая цифра номера должна быть 7 или 8");

    // Если есть ошибки валидации - сразу возвращаем
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(". ") });
    }

    const result = await pool.query(
      "UPDATE users SET user_name=$1, phone=$2, company=$3 WHERE user_id=$4 returning user_id, user_name, phone, company, is_admin",
      [newName, newPhone, company, userId],
    );

    const updatedUser = result.rows[0];
    const sessionCookie = req.cookies?.sessionId;
    await redisConnection;
    await client.set(sessionCookie, JSON.stringify(updatedUser));
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const codes = new Map();
authRouter.put("/send_code", upload.none(), async function (req, res) {
  try {
    const email = req.body.email;
    const currentTries = tries.get(email) || [];
    if (currentTries.length === 3) {
      const timeGone = Date.now() - currentTries[2]; //время которое прошло с первой попытки из трёх
      if (timeGone < 5 * 60 * 1000) {
        res.status(429).json({ error: "Слишком много попыток" });
        return;
      }
    }
    const currentUser = await pool.query(
      "select user_id, is_admin from users where email=$1",
      [email],
    );

    if (currentUser.rows.length === 0) {
      res.status(400).json({ error: "Вы не зарегистрированы" });
      return;
    }
    console.log(currentUser.rows[0].is_admin);
    if (currentUser.rows[0].is_admin) {
      res.status(400).json({ error: "Администраторам нельзя менять пароль" });
      return;
    }

    const code = Math.round(Math.random() * 1000000); //число от 1 до 1000000
    emailService.sendVerificationCode(email, code);
    const timer = Date.now();
    codes.set(email, { code, timer, tries: 0 });
    res.status(200).json({});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

authRouter.put("/change_password", upload.none(), async function (req, res) {
  const errors = [];
  try {
    const code = req.body.code;
    const email = req.body.email;
    const password = req.body.password;
    const codeInfo = codes.get(email);
    const currentTries = tries.get(email) || [];
    if (currentTries.length === 3) {
      const timeGone = Date.now() - currentTries[2]; //время которое прошло с первой попытки из трёх
      if (timeGone < 5 * 60 * 1000) {
        res.status(429).json({ error: "Слишком много попыток" });
        return;
      }
    }
    if (!codeInfo) {
      //чтобы нельзя было ввести чужой email
      res.status(400).json({ error: "Неверный email" });
      return;
    }
    if (codeInfo.code != code) {
      tries.set(email, [Date.now(), ...(tries.get(email) || []).slice(0, 2)]); //добавляем в начало дату, копируя в хвост что было до этого(первые два элемента) или пустой массив если ничего не было
      res.status(400).json({ error: "Неверный код" });
      return;
    }
    const currentUser = await pool.query(
      "select user_id from users where email=$1",
      [email],
    );
    if (!currentUser.rows.length) {
      res.status(400).json({ error: "Вы не зарегистрированы" });
      return;
    }

    const timeDif = (Date.now() - codeInfo.timer) / 1000;
    if (timeDif > 600) {
      res.status(400).json({ error: "Время действия кода истекло" });
      return;
    }
    // Пароль
    !password && errors.push("Пароль обязателен");
    password?.length < 6 &&
      errors.push("Пароль должен быть не менее 6 символов");
    password?.length > 50 &&
      errors.push("Пароль должен быть не более 50 символов");
    password &&
      /\s/.test(password) &&
      errors.push("Пароль не должен содержать пробелы");
    password &&
      !/[A-Z]/.test(password) &&
      errors.push("Пароль должен содержать хотя бы одну заглавную букву");
    password &&
      !/[0-9]/.test(password) &&
      errors.push("Пароль должен содержать хотя бы одну цифру");
    password &&
      !/[\W_]/.test(password) &&
      errors.push("Пароль должен содержать хотя бы один специальный символ");
    password &&
      /[а-яА-ЯёЁ]/.test(password) &&
      errors.push("Пароль должен содержать только латиницу");

    // Если есть ошибки валидации - сразу возвращаем
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(". ") });
    }
    const userId = currentUser.rows[0].user_id;

    await pool.query("update users set password=$1 where user_id=$2", [
      hashPasswordMD5(password),
      userId,
    ]);
    codes.clear();
    res.status(200).json({});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

authRouter.delete("/delete_acc", async function (req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Не авторизован" });
    }
    const userId = req.user.user_id;
    const sessionId = req.cookies.sessionId;

    await pool.query("DELETE FROM users WHERE user_id = $1", [userId]);
    await client.del(sessionId);

    res
      .status(200)
      .clearCookie("sessionId")
      .json({ message: "Аккаунт успешно удален" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
