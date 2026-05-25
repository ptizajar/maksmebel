const express = require("express");
const multer = require("multer");//middleware для загрузки файлов
const upload = multer();
const fs = require("fs").promises;
export const adminRouter = express.Router();
import { pool } from "./connections";

function isAdmin(req, res, next) {
  if (!req.user?.is_admin) {
    res.status(401).json({});
    return;
  }
  next();
}

adminRouter.use(isAdmin);

adminRouter.put(
  "/category",
  upload.single("category_image"),
  async function (req, res) {
    const { category_name, category_id } = req.body;

    try {
      const binaryData = req.file?.buffer;

      if (category_id) {
        //РЕДАКТИРОВАНИЕ

        // проверка уникальности названия
        const checkExisting = await pool.query(
          "SELECT COUNT(*) as count FROM category WHERE LOWER(TRIM(category_name)) = LOWER(TRIM($1)) AND category_id != $2",
          [category_name, category_id],
        );

        if (checkExisting.rows[0]?.count > 0) {
          return res.status(409).json({
            error: "Категория с таким названием уже существует",
          });
        }

        // само редактирование

        await pool.query(
          "UPDATE category SET category_name=$1 WHERE category_id=$2",
          [category_name, category_id],
        );
        if (binaryData) {
          await fs.unlink(`/var/images/categories/${category_id}`);
          await fs.writeFile(
            `/var/images/categories/${category_id}`,
            binaryData,
          );
        }

        res.status(200).json({});
      } else {
        // ДОБАВЛЕНИЕ

        // проверка уникальности названия
        const checkExisting = await pool.query(
          "SELECT COUNT(*) as count FROM category WHERE LOWER(TRIM(category_name)) = LOWER(TRIM($1))",
          [category_name],
        );

        if (checkExisting.rows[0]?.count > 0) {
          return res.status(409).json({
            error: "Категория с таким названием уже существует",
          });
        }

        // само добавление
        const result = await pool.query(
          "INSERT INTO category (category_name) VALUES ($1) RETURNING *",
          [category_name],
        );
        await fs.writeFile(
          `/var/images/categories/${result.rows[0].category_id}`,
          binaryData,
        );

        res.status(200).json(result.rows[0]);
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

adminRouter.delete(
  "/delete_category/:id",
  upload.none(),
  async function (req, res) {
    try {
      const param = req.params.id;
      const count = await pool.query(
        "select count(*) from item where category_id=$1",
        [param],
      );
      if (count.rows[0].count > 0) {
        return res.status(409).json({
          error: "Категория не пуста",
        });
      }
      await pool.query("delete from category where category_id=$1", [param]);
      await fs.unlink(`/var/images/categories/${param}`);
      res.status(200).json({});
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

adminRouter.delete(
  "/delete_item/:id",
  upload.none(),
  async function (req, res) {
    try {
      const param = req.params.id;
      const ordersCount = await pool.query(
        "select count(*) from orders where item_id=$1",
        [param],
      );
      if (ordersCount.rows[0].count > 0) {
        return res
          .status(409)
          .json({ error: "На этот товар оформлялись заказы" });
      }
      await pool.query("delete from item where item_id=$1", [param]);
      await fs.unlink(`/var/images/items/${param}`);
      res.status(200).json({});
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

adminRouter.put(
  "/item",
  upload.single("item_image"),
  async function (req, res) {
    const {
      item_id,
      article,
      item_name,
      length,
      width,
      height,
      quantity,
      price,
      description,
      show,
      category_id,
    } = req.body;

    try {
      await pool.query("SET TIME ZONE 'Europe/Moscow'");
      const binaryData = req.file?.buffer;

      if (item_id) {
        // РЕДАКТИРОВАНИЕ

        // проверка уникальности названия
        const checkExistingName = await pool.query(
          "SELECT COUNT(*) as count FROM item WHERE LOWER(TRIM(item_name)) = LOWER(TRIM($1)) AND item_id != $2",
          [item_name, item_id],
        );
        if (checkExistingName.rows[0]?.count > 0) {
          return res
            .status(409)
            .json({ error: "Товар с таким названием уже существует" });
        }

        // проверка уникальности артикула
        const checkExistingArt = await pool.query(
          "SELECT COUNT(*) as count FROM item WHERE article = $1 AND item_id != $2",
          [article, item_id],
        );
        if (checkExistingArt.rows[0]?.count > 0) {
          return res
            .status(409)
            .json({ error: "Товар с таким артикулом уже существует" });
        }

        // само редактирование
        const currentItem = await pool.query(
          "SELECT price FROM item WHERE item_id = $1",
          [item_id],
        );
        const oldPrice = currentItem.rows[0]?.price;

        await pool.query(
          "UPDATE item SET article=$1, item_name=$2, length=$3, width=$4, height=$5, quantity=$6, price=$7, description=$8, show=$9 WHERE item_id=$10",
          [
            article,
            item_name,
            parseFloat(length),
            parseFloat(width),
            parseFloat(height),
            parseInt(quantity),
            parseFloat(price),
            description,
            show == "on",
            item_id,
          ],
        );

        if (binaryData) {
          await fs.unlink(`/var/images/items/${item_id}`);
          await fs.writeFile(`/var/images/items/${item_id}`, binaryData);
        }

        if (oldPrice != price) {
          await pool.query(
            "INSERT INTO price_history (item_id, price) VALUES ($1, $2)",
            [item_id, parseFloat(price)],
          );
        }

        res.status(200).json({});
      } else {
        // ДОБАВЛЕНИЕ

        // проверка уникальности названия
        const checkExistingName = await pool.query(
          "SELECT COUNT(*) as count FROM item WHERE LOWER(TRIM(item_name)) = LOWER(TRIM($1))",
          [item_name],
        );
        if (checkExistingName.rows[0]?.count > 0) {
          return res
            .status(409)
            .json({ error: "Товар с таким названием уже существует" });
        }

        // проверка уникальности артикула
        const checkExistingArt = await pool.query(
          "SELECT COUNT(*) as count FROM item WHERE article = $1",
          [article],
        );
        if (checkExistingArt.rows[0]?.count > 0) {
          return res
            .status(409)
            .json({ error: "Товар с таким артикулом уже существует" });
        }

        // само добавление
        const result = await pool.query(
          "INSERT INTO item (item_name, article, length, width, height, price, description, show, category_id, quantity, removed) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *",
          [
            item_name,
            article,
            parseFloat(length),
            parseFloat(width),
            parseFloat(height),
            parseFloat(price),
            description,
            show == "on",
            category_id,
            parseInt(quantity),
            false,
          ],
        );

        await fs.writeFile(
          `/var/images/items/${result.rows[0].item_id}`,
          binaryData,
        );
        await pool.query(
          "INSERT INTO price_history (item_id, price) VALUES ($1, $2)",
          [result.rows[0].item_id, parseFloat(price)],
        );

        res.status(200).json(result.rows[0]);
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

adminRouter.post("/remove_item/:id", async function (req, res) {
  try {
    const param = req.params.id;
    await pool.query("update item set removed=not removed where item_id=$1", [
      param,
    ]);
    res.status(200).json({});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get(
  "/category/:id/all_items",
  upload.none(),
  async function (req, res) {
    try {
      const param = req.params.id;
      const result = await pool.query(
        "select item_id, item_name, price, removed,  length, width, height from item where category_id=$1 ORDER BY removed ASC",
        [param],
      );
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

adminRouter.put("/changeStatus", upload.none(), async function (req, res) {
  try {
    const status = req.body.status;
    const o_id = req.body.id;
    await pool.query("update orders set status=$1 where order_id=$2", [
      status,
      o_id,
    ]);
    res.status(200).json({});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get("/bids", async function (req, res) {
  try {
    const result = await pool.query(
      `SELECT o.order_id, o.date, u.email, o.user_name, u.company, o.item_id, i.article, o.price, o.recall_date, o.phone, o.status 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.user_id 
      LEFT JOIN item i ON o.item_id = i.item_id 
      ORDER BY o.recall_date ASC `,
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.get("/price_history/:item_id", async function (req, res) {
  try {
    const param = req.params.item_id;
    const result = await pool.query(
      `select i.item_name, p.price, p.changed_at AT TIME ZONE 'Europe/Moscow' as moscow_time 
      from price_history p 
      left join item i on p.item_id =  i.item_id 
      where p.item_id=$1 
      order by p.changed_at`,
      [param],
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
