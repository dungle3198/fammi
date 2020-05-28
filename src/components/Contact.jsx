import React, { Component } from 'react'
import Navbar from './Navbar'

export default class Contact extends Component {
    render() {
        return (
            <div className = "Contact">
                <Navbar/>
                <div className = "container">
                    <h1>Contact</h1>
                    <p>
                        This is our contact email:
                        <br/>
                        unknownteam2020@outlook.com
                        <br/>
                        This is our contact email:
                        089888241
                    </p>
                </div>
            </div>
        )
    }
}
