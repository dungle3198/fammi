import React, { Component } from 'react'
import Navbar from './Navbar'

export default class About extends Component {
    render() {
        return (
            <div className = "About">
                <Navbar/>
                <div className = "container">
                    <h1>About</h1>
                    <p>
                        We are an unknown team 
                        and we are developing an app for family management
                    </p>
                </div>
            </div>
        )
    }
}
