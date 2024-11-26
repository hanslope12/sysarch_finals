import {Link, useNavigate} from 'react-router-dom';
import { useState, useEffect, React} from 'react'
import '../css/navbar.css'

export function Navbar(){
  const [searchTerm, setSearch] = useState([]);
  const handlechange = (event) =>{
      setSearch(event.target.value);
    }
    let navigate = useNavigate(); 
    const routeChange = () =>{ 
      let path = `/animesmal/search/${searchTerm}`; 
      navigate(path);
    }
    return(
    <header className="navbar-header">
      <h1 className="navbar-title">MY ANIME DATABASE</h1>
      <nav>
        <Link to="/" className="navbar-link">Home</Link>
        <Link to="/Ranking/2023" className="navbar-link">Ranking 2023</Link>
        <Link to="/Ranking/2024" className="navbar-link">Ranking 2024</Link>
        <Link to="/Compare"  className="navbar-link">Compare</Link>
        <input type="text" placeholder='Search' value={searchTerm} onChange={handlechange}/>
        <button type="button" onClick={routeChange}></button>
      </nav>
    </header>
    )
}