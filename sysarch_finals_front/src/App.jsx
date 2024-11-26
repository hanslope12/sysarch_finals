
import {HashRouter as Router, Routes, Route} from 'react-router-dom'
import { Home } from './pages/Home'
import { Ranking2023 } from './pages/Ranking/2023'
import { Ranking2024 } from './pages/Ranking/2024'
import { Compare } from './pages/Compare'
import { ErrorPage } from './pages/ErrorPage'
import{AnimePage} from './pages/AnimePage'
import 'bootstrap/dist/css/bootstrap.min.css'
import { SearchPage } from './pages/SearchPage'

function App() {
  
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Ranking/2023" element={<Ranking2023 />} />
          <Route path="/Ranking/2024" element={<Ranking2024 />} />
          <Route path="/Compare" element={<Compare />} />
          <Route path="/Animesmal/:id" element={<AnimePage/>} />
          <Route path="/Animesmal/search/:title" element={<SearchPage/>} />
          <Route path='*' element={<ErrorPage/>}/>
        </Routes>
      </Router>
    </div>
  )
}

export default App
