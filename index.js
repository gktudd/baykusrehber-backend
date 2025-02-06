const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// 📌 **Zamanı "X zaman önce" formatına çevirme fonksiyonu**
const timeAgo = (timestamp) => {
    if (!timestamp) return "Bilinmeyen zaman";
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

// 📌 **Google Places API'den FOTOĞRAFLARI al**
app.get("/api/google-photos", async (req, res) => {
    const { placeId } = req.query;
    if (!placeId) {
        return res.status(400).json({ error: "❌ Place ID gereklidir." });
    }

    try {
        console.log(`📸 Google Fotoğraf API isteği yapılıyor: placeId=${placeId}`);

        const response = await axios.get("https://maps.googleapis.com/maps/api/place/details/json", {
            params: {
                place_id: placeId,
                fields: "photos",
                key: GOOGLE_PLACES_API_KEY,
            },
        });

        if (response.data.status !== "OK") {
            console.error("❌ Google API Hatası:", response.data);
            return res.status(404).json({ error: "❌ Fotoğraflar alınamadı veya API sınırına ulaşıldı." });
        }

        const photos = response.data.result?.photos || [];
        if (photos.length === 0) {
            return res.status(404).json({ error: "⚠️ Bu mekan için fotoğraf bulunamadı." });
        }

        // 📌 **Fotoğraf URL'lerini düzgün formatta döndürme**
        const photoUrls = photos.map(photo =>
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
        );

        console.log(`✅ Fotoğraflar başarıyla çekildi (${photoUrls.length} adet).`);
        res.json(photoUrls); // 📌 Direkt URL listesi döndürülüyor (format hatası giderildi)
    } catch (error) {
        console.error("🔥 Google Fotoğrafları API hatası:", error.message);
        res.status(500).json({ error: "❌ Fotoğraflar alınamadı." });
    }
});

// 📌 **Google Places API'den YORUMLARI al (Sadece ilk 5 yorum)**
app.get("/api/google-reviews", async (req, res) => {
    const { placeId } = req.query;
    if (!placeId) {
        return res.status(400).json({ error: "❌ Place ID gereklidir." });
    }

    try {
        console.log(`📝 Google Yorum API isteği yapılıyor: placeId=${placeId}`);

        const response = await axios.get("https://maps.googleapis.com/maps/api/place/details/json", {
            params: {
                place_id: placeId,
                fields: "reviews,rating,user_ratings_total",
                language: "tr",
                key: GOOGLE_PLACES_API_KEY,
            },
        });

        if (response.data.status !== "OK") {
            console.error("❌ API Hatası:", response.data);
            return res.status(404).json({ error: "❌ Restoran bilgileri alınamadı veya API sınırına ulaşıldı." });
        }

        const result = response.data.result;
        if (!result) {
            return res.status(404).json({ error: "⚠️ Restoran bilgileri bulunamadı." });
        }

        const rating = result.rating || 0;
        const ratingCount = result.user_ratings_total || 0;
        const reviews = result.reviews || [];

        // 📌 **SADECE İLK 5 YORUMU AL**
        const formattedReviews = reviews.slice(0, 5).map(review => ({
            author: review.author_name,
            rating: review.rating,
            text: review.text,
            time: timeAgo(review.time),
        }));

        console.log(`✅ Yorumlar başarıyla çekildi (${formattedReviews.length} adet).`);
        res.json({
            rating,
            ratingCount,
            reviews: formattedReviews,
        });
    } catch (error) {
        console.error("🔥 Google Reviews API hatası:", error.message);
        res.status(500).json({ error: "❌ Yorumlar alınamadı." });
    }
});

// 📌 **Sunucuyu başlat**
app.listen(PORT, () => {
    console.log(`🚀 Server çalışıyor: http://localhost:${PORT}`);
});