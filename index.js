const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// 📌 Routes klasörünü dahil et
const routes = require("./routes");
app.use("/api", routes); // 🔥 Tüm route'lar burada birleşecek

// 📌 Server başlat
app.listen(PORT, () => {
  console.log(`🚀 Server çalışıyor: http://localhost:${PORT}`);
});