const express = require('express');
const mongoose = require('mongoose');
const cors  = require('cors');
const connectDB = require('./mongodb');
const axios = require('axios');
const Anime = require('./models/anime');

const app = express();
const port = 3000;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

connectDB();

app.use(cors());
app.use(express.json());

//Local first 25 anime based on id
app.get('/animes', async (req, res) => {
    try {
        console.log('Fetching the first 25 anime with images from the local dataset...');
		const animes = await Anime.find({}, { _id: 0, anime_id: 1, Name: 1, Genres: 1, Ranked: 1 }).limit(25);
		
        if (!animes || animes.length === 0) {
			console.log('No anime found in the local dataset.');
            return res.status(404).json({ error: 'No anime found in the local dataset.' });
        }

        const animeWithImages = [];

        for (const anime of animes) {
            try {
                console.log(`Fetching image for anime_id: ${anime.anime_id}`);
                
                const animeResponse = await axios.get(`https://api.jikan.moe/v4/anime/${anime.anime_id}`);
                const animeData = animeResponse.data.data;
                const imageUrl = animeData.images.webp.large_image_url;

                animeWithImages.push({
                    ...anime.toObject(),
                    Image: imageUrl || 'N/A',
                });
                await sleep(2000);
            } catch (err) {
                console.error(`Failed to fetch image for anime_id: ${anime.anime_id}`, err.message);
                animeWithImages.push({
                    ...anime.toObject(),
                    Image: 'N/A',
                });
            }
        }
		console.log('Anime data with images successfully fetched.');
        res.json(animeWithImages); 
    } catch (err) {
        console.error('Error fetching anime:', err);
        res.status(500).json({ error: 'Failed to fetch anime.' });
    }
});

//MAL first 25 anime based on id
app.get('/animesmal', async (req, res) => {
    try {
        console.log("Fetching top anime from remote dataset...");

        const animeResponse = await axios.get(`https://api.jikan.moe/v4/anime`);

        const AnimeData = animeResponse.data.data.map((anime) => {
            const allGenres = [
                ...anime.genres.map((genre) => genre.name),
                ...(anime.explicit_genres || []).map((genre) => genre.name),
                ...(anime.themes || []).map((theme) => theme.name),
                ...(anime.demographics || []).map((demographic) => demographic.name),
            ].join(", ");

            return {
                anime_id: anime.mal_id,
                Name: anime.title,
                Genres: allGenres || "N/A",
                Ranked: anime.rank,
                Image: anime.images.webp.large_image_url || "N/A"
            };
        });

        AnimeData.sort((a, b) => a.anime_id - b.anime_id);
		console.log('Remote dataset fetched and sorted.');
        res.json(AnimeData);
    } catch (err) {
        console.error("Error fetching anime data:", err.message);
        res.status(500).json({ error: "Failed to fetch and process anime data" });
    }
});

//Local anime id search
app.get('/animes/:id', async (req, res) => {
    try {
        const animeId = parseInt(req.params.id);
        console.log(`Fetching local data for anime_id: ${animeId}`);
        
        const anime = await Anime.findOne(
            { anime_id: animeId },
            { _id: 0, anime_id: 1, Name: 1, Genres: 1, Ranked: 1 }
        );

        if (!anime) {
			console.log(`Anime with id ${animeId} not found.`);
            return res.status(404).json({ error: `Anime with id ${animeId} not found` });
        }

        let imageUrl = 'N/A';
        try {
            console.log(`Fetching image for anime_id: ${animeId}`);
            const animeResponse = await axios.get(`https://api.jikan.moe/v4/anime/${animeId}`);
            imageUrl = animeResponse.data.data.images.webp.large_image_url || 'N/A';
        } catch (err) {
            console.error(`Failed to fetch image for anime_id ${animeId}:`, err.message);
        }

		console.log(`Data for anime_id ${animeId} fetched successfully.`);
        res.json({ ...anime.toObject(), Image: imageUrl });
    } catch (err) {
        console.error(`Error fetching local data for anime_id ${req.params.id}:`, err);
        res.status(500).json({ error: `Failed to fetch data for anime_id ${req.params.id}` });
    }
});

//MAL anime id search
app.get('/animesmal/:id', async (req, res) => {
    try {
        const animeId = req.params.id;
        console.log(`Fetching data for anime_id: ${animeId}`);

        const animeResponse = await axios.get(`https://api.jikan.moe/v4/anime/${animeId}`);

        const animeData = animeResponse.data.data;

        const allGenres = [
            ...animeData.genres.map((genre) => genre.name),
            ...(animeData.explicit_genres || []).map((genre) => genre.name),
            ...(animeData.themes || []).map((theme) => theme.name),
            ...(animeData.demographics || []).map((demographic) => demographic.name),
        ].join(", ");

        const response = {
            anime_id: animeData.mal_id,
            Name: animeData.title,
            Genres: allGenres || "N/A",
            Ranked: animeData.rank,
            Image: animeData.images.webp.large_image_url || 'N/A'
        };
		console.log(`Data for anime_id ${animeId} fetched successfully.`);
        res.json(response);
    } catch (err) {
        console.error(`Error fetching data for anime_id ${req.params.id}:`, err.message);
        res.status(500).json({ error: `Failed to fetch data for anime_id ${req.params.id}` });
    }
});

//Local anime ranking vs MAL ranking
app.get('/animescompare', async (req, res) => {
    try {
        console.log("Fetching local anime data...");

        const localAnimes = await Anime.find(
            { Ranked: { $lte: 25 } },
            { _id: 0, anime_id: 1, Name: 1, Ranked: 1 }
        );
		console.log("Local anime data fetched:", localAnimes);

        const comparisons = [];
        for (const localAnime of localAnimes) {
            try {
                console.log(`Fetching remote data for anime_id: ${localAnime.anime_id}`);

                const remoteResponse = await axios.get(`https://api.jikan.moe/v4/anime/${localAnime.anime_id}`);
                const remoteAnime = remoteResponse.data.data;

                comparisons.push({
                    anime_id: localAnime.anime_id,
                    Name: localAnime.Name,
                    OldRank: localAnime.Ranked,
                    NewRank: remoteAnime.rank,
                    RankDifference: (localAnime.Ranked || 0) - (remoteAnime.rank || 0),
                    Image: remoteAnime.images.webp.large_image_url || "N/A"
                });
                await sleep(2000);
            } catch (error) {
                console.error(`Failed to fetch remote data for anime_id: ${localAnime.anime_id}`, error.message);
            }
        }

        comparisons.sort((a, b) => a.OldRank - b.OldRank);

        console.log("Comparison results sorted by LocalRank:", comparisons);

        res.json(comparisons);
    } catch (err) {
        console.error("Error comparing anime ranks:", err);
        res.status(500).json({ error: "Failed to compare anime ranks" });
    }
});

//MAL ranking vs local ranking or new anime
app.get('/animescomparemal', async (req, res) => {
    try {
        console.log("Fetching top anime from remote dataset...");
        
        const animeResponse = await axios.get(`https://api.jikan.moe/v4/top/anime`);

        const topAnimeData = animeResponse.data.data.map((anime) => {
            const allGenres = [
                ...anime.genres.map((genre) => genre.name),
                ...(anime.explicit_genres || []).map((genre) => genre.name),
                ...(anime.themes || []).map((theme) => theme.name),
                ...(anime.demographics || []).map((demographic) => demographic.name),
            ].join(", ");

            return {
                anime_id: anime.mal_id,
                Name: anime.title,
                Genres: allGenres || "N/A",
                Ranked: anime.rank,
                Image: anime.images.webp.large_image_url || "N/A",
            };
        });

        const malIds = topAnimeData.map((anime) => anime.anime_id);
		console.log("Fetching matching animes from local dataset...");

        const localAnimes = await Anime.find(
            { anime_id: { $in: malIds } },
            { _id: 0, anime_id: 1, Ranked: 1 }
        );

        const localAnimeMap = localAnimes.reduce((acc, anime) => {
            acc[anime.anime_id] = anime.Ranked;
            return acc;
        }, {});

        const comparisons = topAnimeData.map((anime) => {
            const oldRank = localAnimeMap[anime.anime_id];
            if (oldRank !== undefined) {
                return {
                    ...anime,
                    OldRank: oldRank,
                    RankDifference: oldRank - anime.Ranked,
                };
            } else {
                return {
                    ...anime,
                    Status: "*NEW ANIME*",
                };
            }
        });

        comparisons.sort((a, b) => a.Ranked - b.Ranked);
		console.log("Comparison results sorted:", comparisons);
        res.json(comparisons);
    } catch (err) {
        console.error("Error fetching and comparing top anime data:", err.message);
        res.status(500).json({ error: "Failed to fetch and compare anime data" });
    }
});

//Server is running on port number
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

/*
priority list, backend
[✔]1. Mongodb, kaggle dataset, display basic data, animeid, anime name and anime rank
[✔]2. Jikan, jikan api data, display basic data, animeid, anime name and anime rank
[✔]3. Compare mongodb and jikan data, display.

front-end
1.Get post request from backend
*/