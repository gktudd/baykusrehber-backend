const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// 📌 GOOGLE FOTOĞRAFLARI GETİRME ENDPOINTİ
app.get("/api/google-photos", async (req, res) => {
    const placeId = req.query.placeId;
    if (!placeId) {
        return res.status(400).json({ error: "placeId parametresi gereklidir." });
    }

    try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json`, {
            params: {
                place_id: placeId,
                fields: "photos",
                key: GOOGLE_PLACES_API_KEY,
            },
        });

        const placeDetails = response.data.result;
        if (!placeDetails || !placeDetails.photos) {
            return res.status(404).json({ error: "Fotoğraf bulunamadı." });
        }

        const photoUrls = placeDetails.photos.map(photo => 
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photo.photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
        );

        res.json(photoUrls);
    } catch (error) {
        console.error("Google Photos API hatası:", error.message);
        res.status(500).json({ error: "Fotoğraflar alınamadı." });
    }
});

// 📌 Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`🚀 Server çalışıyor: http://localhost:${PORT}`);
});