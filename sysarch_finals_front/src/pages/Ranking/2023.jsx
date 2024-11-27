import { Link } from 'react-router-dom';
import { Navbar } from '../navbar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

export function Ranking2023() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch rankings data
  useEffect(() => {
    const fetchRankingData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/animes');
        console.log('Rankings data: ', response.data);
        setRankings(response.data);
      } catch (err) {
        setError('Failed to load anime rankings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRankingData();
  }, []);

  // loading message
  if (loading) {
    return (
      <div>
        <Navbar />
        <div class="sharingon">
          <div class="ring">
          <div class="to"></div>
          <div class="to"></div>
          <div class="to"></div>
          <div class="circle"></div>
          </div>
        </div>
        <p id='loading-txt'>Loading..</p>
      </div>
    );
  }

  // error message
  if (error) {
    return (
      <div>
        <Navbar />
        <h1>{error}</h1>
      </div>
    );
  }

  //Ranking table
  return (
    <>
      <Navbar />
      <h1>Anime Rankings</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Anime Name</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody>
          {rankings.length === 0 ? (
            <tr>
              <td colSpan="3">No ranking data available</td>
            </tr>
          ) : (
            rankings.map((ranking, index) => (
              <tr key={ranking.anime_id}>
                <td>{index + 1}</td> {/* Adjusting to display the correct rank number */}
                <td><Link to={`/animesmal/${ranking.anime_id}`}>{ranking.Name}</Link></td>
                <td>
                  <img
                    src={ranking.Image === 'N/A' ? 'default-image.jpg' : ranking.Image}
                    alt={ranking.Name}
                    style={{ width: '100px', height: 'auto' }}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
}
