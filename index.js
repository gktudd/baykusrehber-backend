const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// 📌 GOOGLE FOTOĞRAFLARI GETİRME ENDPOINTİ (Path parametresi ile)
app.get("/api/google-photos/:placeId", async (req, res) => {
    const { placeId } = req.params;
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
        console.error("🔥 Google Photos API hatası:", error.message);
        res.status(500).json({ error: "Fotoğraflar alınamadı." });
    }
});

// 📌 GOOGLE YORUMLARI GETİRME ENDPOINTİ (Path parametresi ile)
app.get("/api/google-reviews/:placeId", async (req, res) => {
    const { placeId } = req.params;
    if (!placeId) {
        return res.status(400).json({ error: "placeId parametresi gereklidir." });
    }

    try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json`, {
            params: {
                place_id: placeId,
                fields: "reviews,rating,user_ratings_total",
                language: "tr",
                key: GOOGLE_PLACES_API_KEY,
            },
        });

        const result = response.data.result;
        if (!result) {
            return res.status(404).json({ error: "Restoran bilgileri bulunamadı." });
        }

        const rating = result.rating || 0; // 📌 Restoranın genel puanı
        const ratingCount = result.user_ratings_total || 0; // 📌 Kaç kişi puan vermiş
        const reviews = result.reviews || [];

        const formattedReviews = reviews.map(review => ({
            author: review.author_name,
            rating: review.rating,
            text: review.text,
            time: new Date(review.time * 1000).toLocaleString("tr-TR"),
        }));

        res.json({
            rating,
            ratingCount,
            reviews: formattedReviews.length > 0 ? formattedReviews : [],
        });

    } catch (error) {
        console.error("🔥 Google Reviews API hatası:", error.message);
        res.status(500).json({ error: "Yorumlar alınamadı." });
    }
});

// 📌 Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`🚀 Server çalışıyor: http://localhost:${PORT}`);
});