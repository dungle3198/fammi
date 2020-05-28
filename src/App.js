import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import './App.css';
//import {login} from "./components/Home";
import Home from "./components/Home";
import About from "./components/About";
import Contact from "./components/Contact";
import User from "./components/User";
import CalendarUser from './components/Calendar';
import Todolist from './components/Todolist';
import Post from './components/Post';
import GroupChat from './components/GroupMsg';
import chat from "./components/Messenger";
//var cookie = require("js-cookie");





export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {
        email: "",
        username: ""
      }, email: ""
    };
    chat.init()
  }
  login(user) {

    this.setState({ user: user })
  }

  handleDisplay = () => {

    return (
      <Router>
        <div className="container-fluid m-0 p-0 h-100">
          <Switch>
            <Route exact path={"/"} render={() => <Home loginFunction={this.login.bind(this)} />} />
            <Route path={"/user"} render={() => <User user={this.state.user} />} />
            {/*WIP for instant messenger */}
            {<Route path={"/GroupMsg"} component={GroupChat} />}
            <Route path={"/Calendar"} component={CalendarUser} />
            <Route path={"/Post"} component={Post} />
            <Route path={"/Todolist"} component={Todolist} />
            <Route path={"/About"} component={About} />
            <Route path={"/Contact"} component={Contact} />
          </Switch>
        </div>
      </Router>
    )
  }
  render() {
    return (
      <>
        {this.handleDisplay()}
      </>
    )
  }
}

