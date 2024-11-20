import {Link} from 'react-router-dom';

export function Navbar(){
    return(
    <header className="navbar-header">
      <h1 className="navbar-title">MY ANIME DATABASE</h1>
      <nav>
        <Link to="/" className="navbar-link">Home</Link>
        <Link to="/Ranking" className="navbar-link">Ranking</Link>
      </nav>
    </header>
    )
}