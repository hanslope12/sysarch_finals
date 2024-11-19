import { useState, useEffect } from 'react'
import './App.css'
import {HashRouter as Router, Routes, Route} from 'react-router-dom'
import { Home } from './pages/Home'
import { Ranking } from './pages/Ranking'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'

function App() {
  const [count, setCount] = useState(0)
  const [animeList, setAnimeList] = useState([])

  useEffect(() => {
    axios.get('http://localhost:3000/animes')
      .then(response => setAnimeList(response.data))
      .catch(err => console.log(err))
  }, [])

  return (
    <div>
      <table className="table">
        <thead>
          <tr>
            <th>Anime_ID</th>
            <th>Name</th>
            <th>Genres</th>
            <th>Ranked</th>
          </tr>
        </thead>
        <tbody>
          {animeList.map(anime => (
            <tr key={anime.anime_id}>
              <td>{anime.anime_id}</td>
              <td>{anime.Name}</td>
              <td>{anime.Genres}</td>
              <td>{anime.Ranked}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Ranking" element={<Ranking />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
