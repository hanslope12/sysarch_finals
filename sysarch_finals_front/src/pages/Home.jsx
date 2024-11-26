import {Link} from 'react-router-dom';
import { Navbar } from './navbar';
import { useState, useEffect } from 'react'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'

export function Home(){
    const [animeList, setAnimeList] = useState([])

    return(
        <>
        <Navbar/>
        <div>
          <div></div>
          <div className=''></div>
        </div>
        </>
    )
}