const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// 📌 Routes klasörünü dahil et (güncel routes klasörünü içeri alıyoruz!)
const routes = require("./routes");
app.use("/api", routes);

// 📌 Eğer ayrı olarak doğrudan çalışan endpointler isteniyorsa aşağıya da yazılabilir.
// Ama senin yapında `/api/google-reviews` ve diğerleri routes klasöründe tanımlı.

app.listen(PORT, () => {
  console.log(`🚀 Server başarıyla çalışıyor: http://localhost:${PORT}`);
});