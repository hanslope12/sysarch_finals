import {Link, useParams} from 'react-router-dom';
import { Navbar } from './navbar';
import { useState, useEffect } from 'react'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
//need to reload page when search is pressed
export function SearchPage(){
    
    const [anime, setAnime] = useState([])
    const {title} = useParams();
  useEffect(() => {
    axios.get(`http://localhost:3000/animesmal/search/${title}`)
      .then(response => setAnime(response.data))
      .catch(err => console.log(err))
  }, [])
    return(
        <>
        <Navbar/>
        <table className="table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Genres</th>
            <th>Ranked</th>
          </tr>
        </thead>
        <tbody>
        {anime.map((anime) =>(
            <tr key={anime.anime_id}>
              <td><img src={anime.Image} alt={anime.anime_id} /></td>
              <td>
                <h1><Link to={`/animesmal/${anime.anime_id}`}>{anime.Name}</Link></h1>
                <p>{anime.Synopsis}</p>
                </td>
              <td>{anime.Genres}</td>
              <td>{anime.Ranked}</td>
            </tr>
        ))}
        </tbody>
      </table>
        </>
    )
}