const express = require('express');
const mongoose = require('mongoose');
const cors  = require('cors');
const axios = require('axios');
const connectDB = require('./mongodb');
const Anime = require('./models/anime');

const app = express();
const port = 3000;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let hasBackgroundUpdateRun = false;
let hasBackgroundUpdateDosRun = false;

connectDB();

app.use(cors());
app.use(express.json());

// Helper function to fetch and update the image
const fetchAndUpdateImage = async (animeId, delay = 2000) => {
    try {
        //console.log(`Fetching image for anime_id: ${animeId} from Jikan API...`);

        // Delay before making the request
        await sleep(delay);

        // Fetch data from Jikan API
        const response = await axios.get(`https://api.jikan.moe/v4/anime/${animeId}`);
        const imageUrl = response.data.data.images.webp.large_image_url;

        if (imageUrl) {
            // Update the anime entry in the database with the fetched image URL
            await Anime.updateOne(
                { anime_id: animeId },
                { $set: { Image: imageUrl } }
            );
            //console.log(`Image updated for anime_id: ${animeId}`);
            return imageUrl;
        } else {
            console.log(`No valid image found for anime_id: ${animeId}`);
            return 'N/A';
        }
    } catch (err) {
        console.error(`Failed to fetch or update image for anime_id: ${animeId}`, err.message);
        return 'N/A';
    }
};

//Local first 25 anime based on rank
app.get('/animes', async (req, res) => {
    try {
        console.log('Fetching the first 25 anime with images from the local dataset...');
        const animes = await Anime.find({Ranked:{$lte:25}}, { _id: 0, anime_id: 1, Name: 1, Genres: 1, Image: 1,Ranked:1, isUpdating: 1 });

        if (!animes || animes.length === 0) {
            console.log('No anime found in the local dataset.');
            return res.status(404).json({ error: 'No anime found in the local dataset.' });
        }

        const processedAnimes = animes.map((anime) => ({
            ...anime.toObject(),
            Image: anime.Image && anime.Image.trim() ? anime.Image : 'N/A',
        }));

        processedAnimes.sort((a, b) => a.Ranked - b.Ranked);
        console.log('Anime data fetched and sent to client.');
        res.json(processedAnimes);

        if (!hasBackgroundUpdateRun) {
            console.log('Starting background image update process...');
            hasBackgroundUpdateRun = true; // Set the flag
            for (const anime of animes) {
                try {
                    const updatedAnime = await Anime.findOneAndUpdate(
                        { 
                            anime_id: anime.anime_id, 
                            isUpdating: { $ne: true }, // Not currently updating
                            $or: [ // Image is missing or set to 'N/A'
                                { Image: { $exists: false } }, 
                                { Image: 'N/A' }
                            ]
                        },
                        { $set: { isUpdating: true } }, // Mark as updating
                        { new: true } // Return the updated document
                    );
                    
                    if (!updatedAnime) {
                        //console.log(`Skipping anime_id: ${anime.anime_id} as it's either already being updated or doesn't need an update.`);
                        continue; // Skip this anime
                    }
            
                    //console.log(`Updating image for anime_id: ${anime.anime_id}`);
                    await fetchAndUpdateImage(anime.anime_id);
            
                } catch (err) {
                    console.error(`Failed to update image for anime_id ${anime.Ranked}:`, err.message);
                } finally {
                    await Anime.updateOne({ anime_id: anime.Ranked }, { $unset: { isUpdating: "" } });
                    await sleep(2000); // Prevent API throttling
                }
            }

            console.log('Background image update process completed.');
            hasBackgroundUpdateRun = false; // Set the flag
        }
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
            { _id: 0, anime_id: 1, Name: 1, Genres: 1, Ranked: 1, Image: 1 }
        );

        if (!anime) {
            console.log(`Anime with id ${animeId} not found.`);
            return res.status(404).json({ error: `Anime with id ${animeId} not found` });
        }

        if (!anime.Image || anime.Image === 'N/A') {
            anime.Image = 'N/A';
        }
		
        console.log(`Data for anime_id ${animeId} fetched successfully.`);
        res.json(anime);
        
        if (anime.Image === 'N/A' && !hasBackgroundUpdateDosRun) {
				console.log('Starting background image update process...');
				hasBackgroundUpdateDosRun = true;
				try {
					await fetchAndUpdateImage(anime.anime_id);
					console.log('Background image update process completed.');
				} catch (updateError) {
						console.error(`Error updating image for anime_id ${animeId}:`, updateError);
				} finally {
                hasBackgroundUpdateDosRun = false; // Reset flag after update
            }
		}
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
        console.log(animeData.synopsis)
        const response = {
            anime_id: animeData.mal_id,
            Name: animeData.title,
            Genres: allGenres || "N/A",
            Ranked: animeData.rank,
            Image: animeData.images.webp.large_image_url || 'N/A',
            Background: animeData.background,
            Synopsis: animeData.synopsis
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
                //console.log(`Fetching remote data for anime_id: ${localAnime.anime_id}`);

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
                await sleep(1000);
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

//Run in postman to update images, while npm start back is running PUT (http://localhost:3000/update-images)
app.put('/update-images', async (req, res) => {
    try {
        console.log('Starting image update process for the first 25 entries by anime_id and Ranked...');

        // Fetch the first 25 entries sorted by anime_id that are missing images
        const animeById = await Anime.find(
            { $or: [{ Image: { $exists: false } }, { Image: 'N/A' }] },
            { anime_id: 1, Name: 1 }
        )
            .sort({ anime_id: 1 })
            .limit(25);

        // Fetch the first 25 entries sorted by Ranked that are missing images
        const animeByRank = await Anime.find(
            { $or: [{ Image: { $exists: false } }, { Image: 'N/A' }] },
            { anime_id: 1, Name: 1 }
        )
            .sort({ Ranked: 1 })
            .limit(25);

        // Combine the two sets of anime entries, ensuring no duplicates
        const animesToUpdate = [
            ...new Map([...animeById, ...animeByRank].map((item) => [item.anime_id, item])).values()
        ];

        if (animesToUpdate.length === 0) {
            console.log('No anime entries require image updates.');
            return res.json({ message: 'No anime entries need image updates.' });
        }

        console.log(`Found ${animesToUpdate.length} anime entries for image updates.`);

        for (const anime of animesToUpdate) {
            try {
                console.log(`Fetching image for anime_id: ${anime.anime_id}`);
                
                // Fetch the anime data from Jikan API
                const response = await axios.get(`https://api.jikan.moe/v4/anime/${anime.anime_id}`);
                const imageUrl = response.data.data.images.webp.large_image_url;

                if (imageUrl) {
                    // Update the anime entry in the database with the new image URL
                    await Anime.updateOne(
                        { anime_id: anime.anime_id },
                        { $set: { Image: imageUrl } }
                    );
                    console.log(`Image updated for anime_id: ${anime.anime_id}`);
                } else {
                    console.log(`No valid image found for anime_id: ${anime.anime_id}`);
                }

                // To avoid hitting the API rate limit, pause for 2 seconds between requests
                await sleep(2000);
            } catch (err) {
                console.error(`Failed to fetch or update image for anime_id: ${anime.anime_id}`, err.message);
            }
        }

        console.log('Image update process completed.');
        res.json({ message: 'Image update process completed.' });
    } catch (err) {
        console.error('Error during image update process:', err.message);
        res.status(500).json({ error: 'Failed to update images in the database.' });
    }
});

/*
priority list, backend
[✔]1. Mongodb, kaggle dataset, display basic data, animeid, anime name and anime rank
[✔]2. Jikan, jikan api data, display basic data, animeid, anime name and anime rank
[✔]3. Compare mongodb and jikan data, display.

front-end
1.Get post request from backend
*/