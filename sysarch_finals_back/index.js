const express = require('express');
const mongoose = require('mongoose');
const cors  = require('cors');
const connectDB = require('./mongodb');
const Anime = require('./models/anime');
const axios = require('axios');

const app = express();
const port = 3000;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

connectDB();

app.use(cors());
app.use(express.json());

//Local dataset (all)
app.get('/animes', async (req, res) => {
    try {
        console.log('Fetching all anime from local dataset...');

        // Fetch all anime entries from the database
        const animes = await Anime.find({}, { _id: 0, anime_id: 1, Name: 1, Genres: 1, Ranked: 1 });

        if (!animes || animes.length === 0) {
            // If no anime is found, return a 404 error
            return res.status(404).json({ error: 'No anime found in the local dataset.' });
        }

        res.json(animes); // Return all the found anime
    } catch (err) {
        console.error('Error fetching all anime:', err);
        res.status(500).json({ error: 'Failed to fetch all anime.' });
    }
});

//Local dataset (single)
app.get('/animes/:id', async (req, res) => {
    try {
        const animeId = parseInt(req.params.id); // Get the ID from the URL parameter and parse it as an integer
        console.log(`Fetching local data for anime_id: ${animeId}`);

        // Find the anime with the specific `anime_id`
        const anime = await Anime.findOne(
            { anime_id: animeId },
            { _id: 0, anime_id: 1, Name: 1, Genres: 1, Ranked: 1 } // Specify the fields to return
        );

        if (!anime) {
            // If no anime is found, return a 404 error
            return res.status(404).json({ error: `Anime with id ${animeId} not found` });
        }

        res.json(anime); // Return the found anime
    } catch (err) {
        console.error(`Error fetching local data for anime_id ${req.params.id}:`, err);
        res.status(500).json({ error: `Failed to fetch data for anime_id ${req.params.id}` });
    }
});

//Remote dataset
app.get('/animesmal/:id', async (req, res) => {
    try {
        const animeId = req.params.id; // Get the ID from the URL parameter
        console.log(`Fetching data for anime_id: ${animeId}`);

        // Fetch anime data using Axios
        const animeResponse = await axios.get(`https://api.jikan.moe/v4/anime/${animeId}`);

        // Extract relevant fields from the response
        const animeData = animeResponse.data.data; // Access the actual data property

        // Combine genres, explicit genres, themes, and demographics into a single string
        const allGenres = [
            ...animeData.genres.map((genre) => genre.name),
            ...animeData.explicit_genres.map((genre) => genre.name),
            ...animeData.themes.map((theme) => theme.name),
            ...animeData.demographics.map((demographic) => demographic.name)
        ].join(", ");

        // Create the response object
        const response = {
            anime_id: animeData.mal_id,
            Name: animeData.title,
            Genres: allGenres || "N/A",
            Ranked: animeData.rank
        };

        res.json(response);
    } catch (err) {
        console.error(`Error fetching data for anime_id ${req.params.id}:`, err.message);
        res.status(500).json({ error: `Failed to fetch data for anime_id ${req.params.id}` });
    }
});

//comparison local to remote
app.get('/animescompare', async (req, res) => {
    try {
        console.log("Fetching local anime data...");

        const localAnimes = await Anime.find(
            { Ranked: { $lte: 25 } },
            { _id: 0, anime_id: 1, Name: 1, Ranked: 1 }
        );

        console.log("Local anime data:", localAnimes);

        const comparisons = [];
        for (const localAnime of localAnimes) {
            try {
                console.log(`Fetching remote data for anime_id: ${localAnime.anime_id}`);

                const remoteResponse = await axios.get(`https://api.jikan.moe/v4/anime/${localAnime.anime_id}`);
                const remoteAnime = remoteResponse.data.data;

                comparisons.push({
                    anime_id: localAnime.anime_id,
                    Name: localAnime.Name,
                    LocalRank: localAnime.Ranked,
                    RemoteRank: remoteAnime.rank,
                    RankDifference: (localAnime.Ranked || 0) - (remoteAnime.rank || 0),
                });

                // Delay to prevent hitting the API rate limit
                await sleep(1000); // 1 second delay
            } catch (error) {
                console.error(`Failed to fetch remote data for anime_id: ${localAnime.anime_id}`, error.message);
            }
        }

        // Sort the comparisons by LocalRank in ascending order
        comparisons.sort((a, b) => a.LocalRank - b.LocalRank);

        console.log("Comparison results sorted by LocalRank:", comparisons);

        res.json(comparisons);
    } catch (err) {
        console.error('Error comparing anime ranks:', err);
        res.status(500).json({ error: 'Failed to compare anime ranks' });
    }
});

//comparison
app.get('/animescomparemal', async (req, res) => {
    try {
        // Fetch anime data using Axios
        const animeResponse = await axios.get(`https://api.jikan.moe/v4/top/anime`);

        // Extract relevant fields and format the response
        const animeData = animeResponse.data.data.map((anime) => ({
            anime_id: anime.mal_id,
            Name: anime.title,
            Genres: anime.genres.map((genre) => genre.name).join(", "), // Join genres into a string
            Ranked: anime.rank,
        }));

        res.json(animeData); // Send the formatted JSON
    } catch (err) {
        console.error(`Error fetching data:`, err.message);
        res.status(500).json({ error: 'Failed to fetch and format anime data' });
    }
});
  
// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


/*
priority list, backend
[✔]1. Mongodb, kaggle dataset, display basic data, animeid, anime name and anime rank
[✔]2. Jikan, jikan api data, display basic data, animeid, anime name and anime rank
[-]3. Compare mongodb and jikan data, display.

front-end
1.Get post request from backend
*/