import {Link} from 'react-router-dom';
import { Navbar } from './navbar';
import { useState, useEffect } from 'react'
import{Table} from './table'
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
        <Table></Table>
        <h1>This is the Home page</h1>
        
        </>
    )
}