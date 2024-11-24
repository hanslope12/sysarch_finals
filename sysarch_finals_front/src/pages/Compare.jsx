import {Link} from 'react-router-dom';
import { Navbar } from './navbar';
import { useState, useEffect } from 'react'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'

export function Compare(){
  const [animeList, setAnimeList] = useState([])
  const [comparisons, setComparisons] = useState([]);
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState(null); 

  useEffect(() => {
    axios.get('http://localhost:3000/animes')
      .then(response => setAnimeList(response.data))
      .catch(err => console.log(err))
  }, [])

  // Fetch comparison data
  useEffect(() => {
    const fetchComparisonData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/animescompare');
        console.log('Comparison data:', response.data);  
        setComparisons(response.data);  
      } catch (err) {
        setError('Failed to load anime comparison data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchComparisonData();
  }, []);

  // loading message
  if (loading) {
    return (
      <div>
        <Navbar />
        <h1>Loading comparison</h1>
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

  // display comparison table
  return (
    <>
      <Navbar />
      <table className="table">
        <thead>
          <tr>
            <th>Anime Name</th>
            <th>Old Rank</th>
            <th>New Rank</th>
            <th>Rank Difference</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody>
          {comparisons.length === 0 ? (
            <tr>
              <td colSpan="5">No comparison data available</td>
            </tr>
          ) : (
            comparisons.map((comparison) => (
              <tr key={comparison.anime_id}>
                <td>{comparison.Name}</td>
                <td>{comparison.OldRank}</td>
                <td>{comparison.NewRank}</td>
                <td>{comparison.RankDifference}</td>
                <td>
                  <img
                    src={comparison.Image === 'N/A' ? 'default-image.jpg' : comparison.Image}
                    alt={comparison.Name}
                    style={{ width: '100px', height: 'auto' }}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <h1>This is the Compare page</h1>
    </>
  );
}
