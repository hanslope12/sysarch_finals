import {useParams} from 'react-router-dom';
import { Navbar } from './navbar';
import { useState, useEffect } from 'react'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'


export function AnimePage(){
    const [anime, setAnime] = useState([])
    const {id} = useParams();
  useEffect(() => {
    axios.get(`http://localhost:3000/animesmal/${id}`)
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
            <tr key={anime.anime_id}>
              <td><img src={anime.Image} alt={anime.anime_id} /></td>
              <td>
                <h1>{anime.Name}</h1>
                <p>{anime.Synopsis}</p>
                <h1>{anime.Season}</h1>
                </td>
              <td>{anime.Genres}</td>
              <td>{anime.Ranked}</td>
            </tr>
        </tbody>
      </table>    
        </>
    )
}