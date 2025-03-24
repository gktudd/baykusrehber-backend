const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// 📌 ROUTES'u ekle (ÖNEMLİ!)
const googleRoutes = require("./routes/googleRoutes");
app.use("/api", googleRoutes);

// 📌 Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`🚀 Sunucu başarıyla çalışıyor: http://localhost:${PORT}`);
});