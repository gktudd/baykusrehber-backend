require("dotenv").config();
const express = require("express");
const cors = require("cors");

const googleRoutes = require("./routes/googleRoutes");

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(cors());

// Rotalar
app.use("/api/google", googleRoutes);

app.listen(PORT, () => {
  console.log(`✅ BaykusRehber Backend çalışıyor: http://localhost:${PORT}`);
});