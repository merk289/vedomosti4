const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const CATEGORY_MAP = {
  business: "business",
  economic: "economics",
  finances: "finances",
  politics: "politics",
};

const CATEGORY_TITLES = {
  business: "Бизнес",
  economic: "Экономика",
  finances: "Финансы",
  politics: "Политика",
};

app.get("/:count/news/for/:category", async (req, res) => {
  const count = parseInt(req.params.count, 10);
  const category = req.params.category.toLowerCase();

  if (isNaN(count) || count <= 0) {
    return res.status(400).send("Число новостей должно быть целым положительным числом.");
  }
  if (!CATEGORY_MAP[category]) {
    return res
      .status(400)
      .send("Недопустимая категория. Доступны: business, economic, finances, politics.");
  }

  const rssUrl = `https://www.vedomosti.ru/rss/rubric/${CATEGORY_MAP[category]}`;

  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

  try {
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (data.status !== "ok") {
      throw new Error("rss2json вернул ошибку: " + (data.message || "неизвестная ошибка"));
    }

    const items = data.items.slice(0, count);

    res.render("news", {
      count: items.length,
      categoryTitle: CATEGORY_TITLES[category],
      items: items,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Не удалось получить новости. Попробуйте позже.");
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
