import { useState, useEffect } from 'react'
import './App.css'
import {HashRouter as Router, Routes, Route} from 'react-router-dom'
import { Home } from './pages/Home'
import { Ranking } from './pages/Ranking'
import { Compare } from './pages/Compare'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'

function App() {
  
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Ranking" element={<Ranking />} />
          <Route path="/Compare" element={<Compare />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
