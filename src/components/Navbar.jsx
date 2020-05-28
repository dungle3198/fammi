import React, { Component } from 'react'
import { Link } from "react-router-dom";
export default class Navbar extends Component {
    render() {
        return (
            <div className="Navbar">
                {/* Navbar */}
                <nav className="navbar navbar-expand navbar-light bg-white border-bottom">
                    <Link className="nav-brand" to={"/"}> Fammi </Link>
                    
                    <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                        <ul className="navbar-nav ml-auto">
                            <li className="nav-item">
                                <Link className="nav-link" to={"/"}> HOME </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to={"/about"}> ABOUT </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to={"/contact"}> CONTACT </Link>
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>

        )
    }
}
