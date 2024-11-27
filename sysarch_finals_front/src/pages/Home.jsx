import { Link } from 'react-router-dom';
import { Navbar } from './navbar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

export function Home() {
    const [animeList, setAnimeList] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [topAiring, setTopAiring] = useState([]);
    const [animeComparison, setAnimeComparison] = useState([]);

    useEffect(() => {
        axios
            .get('http://localhost:3000/animesmal')
            .then((response) => {
                setAnimeList(response.data);
            })
            .catch((err) => console.log(err));
    }, []);

    useEffect(() => {
        axios
            .get('http://localhost:3000/animes')
            .then((response) => {
                setTopAiring(response.data.slice(0, 5));
            })
            .catch((err) => console.log(err));
    }, []);

    useEffect(() => {
        axios
            .get('http://localhost:3000/animescomparemal')
            .then((response) => {
                setAnimeComparison(response.data.slice(0, 5));
            })
            .catch((err) => console.log(err));
    }, []);

    const showPrevious = () => {
        const newIndex = (currentIndex - 5 + animeList.length) % animeList.length;
        setCurrentIndex(newIndex);
    };

    const showNext = () => {
        const newIndex = (currentIndex + 5) % animeList.length;
        setCurrentIndex(newIndex);
    };

    return (
        <>
            <Navbar />
            <div className="container mt-4">
                <h3>Animes</h3>
                <div className="d-flex align-items-center mt-3">
                    {/* Left Arrow */}
                    <FaArrowLeft
                        className="arrow-icon mx-3"
                        size={30}
                        onClick={showPrevious}
                        style={{ cursor: 'pointer' }}
                    />
                    <div
                        className="d-flex justify-content-start"
                        style={{
                            width: '100%',
                            overflow: 'hidden',
                            gap: '5x',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {animeList.slice(currentIndex, currentIndex + 5).map((anime, index) => (
                            <div
                                key={index}
                                className="card"
                                style={{
                                    width: '200px',
                                    textAlign: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <img
                                    src={anime.Image === 'N/A' ? 'default-image.jpg' : anime.Image}
                                    alt={anime.Name}
                                    className="card-img-top"
                                    style={{ height: '150px', objectFit: 'cover' }}
                                />
                                <div className="card-body">
                                    <h6 className="card-title">{anime.Name}</h6>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Right Arrow */}
                    <FaArrowRight
                        className="arrow-icon mx-3"
                        size={30}
                        onClick={showNext}
                        style={{ cursor: 'pointer' }}
                    />
                </div>

                {/* Top Anime 2023 */}
                <div className="mt-5">
                    <h3>Last Year's Top Anime</h3>
                    <div className="card" style={{ maxWidth: '400px', margin: 'auto' }}>
                        <div className="">
                            <h5 className="mb-0">Top Anime (2023)</h5>
                            <Link to="./Ranking/2023" className="btn btn-primary">
                                View 2023 Ranking
                            </Link>
                        </div>
                        <ul className="list-group list-group-flush">
                            {topAiring.map((anime, index) => (
                                <li
                                    key={index}
                                    className="list-group-item d-flex justify-content-between align-items-start"
                                >
                                    <div className="ms-2 me-auto">
                                        <div className="fw-bold">{`${index + 1}. ${anime.Name}`}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Top Anime 2024 */}
                <div className="mt-5">
                    <h3>This Year's Top Anime</h3>
                    <div className="card" style={{ maxWidth: '400px', margin: 'auto' }}>
                        <div className="">
                            <h5 className="mb-0">Top Anime (2024)</h5>
                            <Link to="./Ranking/2024" className="btn btn-primary">
                                View 2024 Ranking
                            </Link>
                        </div>
                        <ul className="list-group list-group-flush">
                            {animeComparison.map((anime, index) => (
                                <li
                                    key={index}
                                    className="list-group-item d-flex justify-content-between align-items-start"
                                >
                                    <div className="ms-2 me-auto">
                                        <div className="fw-bold">{`${index + 1}. ${anime.Name}`}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            <div><h2>Anime and Manga News</h2></div>
            <div>
                <ol>
                    <li>
                    'Hikaru ga Shinda Natsu' Reveals Main Cast, Staff, Teaser for Summer 2025
                    </li>
                    <li>
                    'Babanbabanban Vampire' Announces Additional Cast Pair
                    </li>
                    <li>
                    'Ninja to Koroshiya no Futarigurashi' Unveils Production Staff, Additional Cast, Teaser Promo for Spring 2025
                    </li>
                </ol>
            </div>
        </>
    );
}
