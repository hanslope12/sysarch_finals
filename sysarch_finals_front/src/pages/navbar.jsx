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
      if(searchTerm != ""){
        let path = `/animesmal/search/${searchTerm}`; 
        navigate(path);
      }else
      {
        let path = `/animesmal/search/cowboybebop`; 
        navigate(path);
      }
      window.location.reload()
    }
    return(
    <header className="navbar-header">
      <h1 className="navbar-title">MY ANIME DATABASE</h1>
      <nav>
        <Link to="/" className="navbar-link">Home</Link>
        <Link to="/Ranking/2023" className="navbar-link">Ranking 2023</Link>
        <Link to="/Ranking/2024" className="navbar-link">Ranking 2024</Link>
        <Link to="/Compare"  className="navbar-link">Compare</Link>  
        <input className='search-bar' type="text" placeholder='Search..' 
        value={searchTerm} onChange={handlechange}/>
        <button className='search-btn' type="button" onClick={routeChange}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg></button>
      </nav>
    </header>
    
    )
}