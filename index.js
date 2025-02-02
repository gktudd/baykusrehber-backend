const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

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

// 📌 GOOGLE YORUMLARI GETİRME ENDPOINTİ (SAYFALAMA DESTEKLİ)
app.get("/api/google-reviews", async (req, res) => {
    const { placeId, pageToken } = req.query;
    if (!placeId) {
        return res.status(400).json({ error: "Place ID gereklidir." });
    }

    try {
        const params = {
            place_id: placeId,
            fields: "reviews,rating,user_ratings_total",
            language: "tr",
            key: GOOGLE_PLACES_API_KEY,
        };

        if (pageToken) {
            params.pagetoken = pageToken; // 📌 Sayfalama için `pageToken` ekleniyor
            console.log("🔵 Sayfalama Token Kullanıldı:", pageToken);
        }

        const response = await axios.get("https://maps.googleapis.com/maps/api/place/details/json", {
            params,
        });

        if (response.data.status !== "OK") {
            console.error("❌ API Hatası:", response.data);
            return res.status(404).json({ error: "Restoran bilgileri alınamadı veya API sınırına ulaşıldı." });
        }

        const result = response.data.result;
        if (!result) {
            return res.status(404).json({ error: "Restoran bilgileri bulunamadı." });
        }

        let nextPageToken = response.data.next_page_token || null; // 📌 Sayfalama için token
        if (nextPageToken) {
            console.log("✅ `nextPageToken` bulundu. 2 saniye bekleniyor...");
            await new Promise(resolve => setTimeout(resolve, 2000)); // 📌 Google API önerisine göre 2 saniye bekleme
        }

        const rating = result.rating || 0;
        const ratingCount = result.user_ratings_total || 0;
        const reviews = result.reviews || [];

        const formattedReviews = reviews.map(review => ({
            author: review.author_name,
            rating: review.rating,
            text: review.text,
            time: timeAgo(review.time),
        }));

        console.log("✅ Yorumlar başarıyla çekildi! Yorum Sayısı:", formattedReviews.length);
        console.log("🔵 Yeni Sayfalama Token:", nextPageToken);

        res.json({
            rating,
            ratingCount,
            reviews: formattedReviews,
            nextPageToken, // 📌 Daha fazla yorum varsa frontend bunu kullanabilir
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