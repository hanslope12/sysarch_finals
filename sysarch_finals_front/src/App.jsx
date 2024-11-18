import { useState } from 'react'
import './App.css'
import {HashRouter as Router, Routes, Route} from 'react-router-dom'
import { Home } from './pages/Home'
import { Ranking } from './pages/Ranking'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/Ranking" element={<Ranking/>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App
