import {Link} from 'react-router-dom';
import { Navbar } from './navbar';
import { useState, useEffect } from 'react'

import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'

export function Compare(){
    const [animeList, setAnimeList] = useState([])

  useEffect(() => {
    axios.get('http://localhost:3000/animes')
      .then(response => setAnimeList(response.data))
      .catch(err => console.log(err))
  }, [])

    return(
        <>
        <Navbar/>
        {/*print kaggle */}
        <h1>KAGGLE DATA</h1>
        <div align="left">
        <table className="table">
        <thead>
          <tr>
            <th>Anime_ID</th>
            <th>Image</th>
            <th>Name</th>
            <th>Genres</th>
            <th>Ranked</th>
          </tr>
        </thead>
        <tbody>
          {animeList.map(anime => (
            <tr key={anime.anime_id}>
              <td>{anime.anime_id}</td>
              <td><img src={anime.Image} alt={anime.anime_id} /></td>
              <td>{anime.Name}</td>
              <td>{anime.Genres}</td>
              <td>{anime.Ranked}</td>
            </tr>
          ))}
        </tbody>
      </table>
        </div>

        {/*print MAL */}
        <h1>MAL DATA</h1>
        <div align="right">
        <table className="table">
        <thead>
          <tr>
            <th>Anime_ID</th>
            <th>Image</th>
            <th>Name</th>
            <th>Genres</th>
            <th>Ranked</th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      </table>
        </div>
        
        <h1>This is the Compare page</h1>
        </>
    )
}