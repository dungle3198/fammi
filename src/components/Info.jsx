import React, { Component } from 'react'
import { BrowserRouter as  Route, Switch } from "react-router-dom";
import Navbar from "./Navbar";
import Home from "./Home";
import About from "./About";
import Contact from "./Contact";

export default class Info extends Component {
    render() {
        return (
            <div className="Info container">
                <Navbar></Navbar>
                <Switch>
                    <Route path={"/about"} component={About} />
                    <Route path={"/contact"} component={Contact} />
                    <Route path={"/"} component={Home} />
                    {/* Footer */}
                </Switch>
                <div className="Footer fixed-bottom bg-white container p-2 text-center">© Fammi 2020</div>
            </div>
        )
    }
}
