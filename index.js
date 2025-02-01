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
        const response = await axios.get("https://maps.googleapis.com/maps/api/place/details/json", {
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

// 📌 Zamanı **"X zaman önce"** formatına çevirme fonksiyonu
const timeAgo = (timestamp) => {
    const now = new Date();
    const reviewDate = new Date(timestamp * 1000);
    const diffInSeconds = Math.floor((now - reviewDate) / 1000);

    const intervals = {
        yıl: 31536000,
        ay: 2592000,
        hafta: 604800,
        gün: 86400,
        saat: 3600,
        dakika: 60,
        saniye: 1
    };

    for (const [key, value] of Object.entries(intervals)) {
        const count = Math.floor(diffInSeconds / value);
        if (count >= 1) {
            return `${count} ${key} önce`;
        }
    }
    return "Az önce";
};

// 📌 GOOGLE YORUMLARI GETİRME ENDPOINTİ
app.get("/api/google-reviews/:placeId", async (req, res) => {
    const { placeId } = req.params;
    if (!placeId) {
        return res.status(400).json({ error: "Place ID gereklidir." });
    }

    try {
        const response = await axios.get("https://maps.googleapis.com/maps/api/place/details/json", {
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

        const rating = result.rating || 0;
        const ratingCount = result.user_ratings_total || 0;
        const reviews = result.reviews || [];

        const formattedReviews = reviews.map(review => ({
            author: review.author_name,
            rating: review.rating,
            text: review.text,
            time: timeAgo(review.time), // 📌 Burada "X zaman önce" formatına çevrildi
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