import React, { Component } from 'react'
import $ from 'jquery';
import { Calendar as cld } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from "@fullcalendar/interaction";
import ReactTooltip from 'react-tooltip'
import { data, event_list } from "./Data/event";
import Post from "./Post";
import Calendar from "./Calendar";
import Profile from "./Profile";
import { docClient } from './Data/user';
import Groupchat from './GroupMsg';
import chat from "./Messenger";
import { Redirect } from "react-router-dom";
import Todolist from './Todolist';

var cookie = require("js-cookie");



export default class User extends Component {
    content = "post";
    constructor(props) {
        super(props)

        this.state = {
            users: [],
            user: [],
            family: [],
            current_list: [],
            comet_login: false,
            refresh: false,
        }
    }

    checkUser() {
        var email = cookie.get("email");
        //console.log(email)
        //alert(email)
        if (email === undefined) {
            return <Redirect to="/" />
        }
        if (email === "") {
            return <Redirect to="/" />
        }

    }
    getDynamoUsers() {
        var params = {
            TableName: "users"
        };

        docClient.scan(params, function (err, data) {
            if (err) {
                console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("Scan succeeded to get all users");
                var user_list = JSON.parse(JSON.stringify(data.Items))
                this.setState({ users: user_list });

            }
        }.bind(this));
    }
    getUser() {
        var params = {
            TableName: "users",
            Key: {
                "email": cookie.get("email")
            }
        };
        docClient.get(params, function (err, data) {
            if (err) {
                cookie.remove("email")
                cookie.remove("username")
                // console.log("users::fetchOneByKey::error - " + JSON.stringify(err, null, 2));
            }
            else {
                //console.log("users::fetchOneByKey::success - " + JSON.stringify(data, null, 2));
                var u = {}
                try {
                    console.log("get user is successful")
                    u = JSON.parse(JSON.stringify(data.Item))
                    chat.Login(u.comet_uid)
                    this.setState({ user: u, comet_login: true })
                    this.getFamily();
                }
                catch (e) {
                    return
                }


            }

        }.bind(this))
    }

    getFamily() {
        var params = {
            TableName: "family",
            Key: {
                "family_key": this.state.user.key
            }
        };
        docClient.get(params, function (err, data) {
            if (err) {
                // console.log("users::fetchOneByKey::error - " + JSON.stringify(err, null, 2));
            }
            else {
                //console.log("users::fetchOneByKey::success - " + JSON.stringify(data, null, 2));
                var u = JSON.parse(JSON.stringify(data.Item))
                this.setState({ family: u })
                this.getDynamoUsers();

            }

        }.bind(this))

    }
    switchContent(page) {
        var classname = ".Function ." + page.charAt(0).toUpperCase() + page.slice(1) + "Li"
        //console.log(classname)
        this.handleHighLight(classname)
        this.setState({ refresh: true })
        this.content = page;
        //console.log(this.content);
        //console.log("Switch Page")
    }
    logout() {
        var cookie = require("js-cookie");
        cookie.remove("email")
        cookie.remove("username")
        window.location.replace("/")
        return
    }
    InitialSetup() {
        this.getUser();
    }
    displayAvatar() {
        var img = require('./imgs/ava.jpg')
        if (this.state.user.avatar === undefined) {
            return img
        }
        if (this.state.user.avatar !== "") {
            return this.state.user.avatar;
        }

        return img

    }
    dispplayImage() {
        if (this.state.user !== null) {
            return (<img className="Avatar border rounded-circle" src={this.displayAvatar()} alt="" width="150px" height="150px" />)
        }
    }
    displayContent() {


        if (this.content === "calendar") {
            return <Calendar user={this.state.user} family={this.state.family} users={this.state.users} />
        }
        if (this.content === "post") {
            return <Post user={this.state.user} family={this.state.family} users={this.state.users} />
        }
        if (this.content === "todolist") {
            return <Todolist user={this.state.user} family={this.state.family} users={this.state.users} />
        }
        if (this.content === "profile") {
            return <Profile user={this.state.user} getUser={this.getUser.bind(this)} />
        }
        if (this.content === "chat") {
            return <Groupchat user={this.state.user} isAuthenticated={true} />
        }
        return null
    }

    updateCalendar() {
        data()
        var list = []
        event_list.forEach(event => {
            if (event.family_key === this.state.user.key) {
                list.push(event)
            }
        })
        this.setState({ current_list: list })
        // this.setState({event_list:list})
        //console.log(event_list)
        //console.log(this.state.event_list)
        $("#minicalendar").html("")
        var calendarEl = document.getElementById('minicalendar');
        var calendar = new cld(calendarEl, {
            defaultView: "dayGridMonth",
            events: list,
            plugins: [dayGridPlugin, interactionPlugin],
            eventPositioned: this.handleEventPositioned,
        });
        calendar.render();
        //console.log("Done")
    }
    updateCalendarMul() {
        this.updateCalendar()
        setTimeout(
            function () {
                this.updateCalendar()
            }
                .bind(this),
            500
        );
        setTimeout(
            function () {
                this.updateCalendar()
            }
                .bind(this),
            1000
        );
        setTimeout(
            function () {
                this.updateCalendar()
            }
                .bind(this),
            1500
        );
    }
    checkDifferent() {
        data()
        var list = []
        event_list.forEach(event => {
            if (event.family_key === this.state.user.key) {
                list.push(event)
            }
        })
        if (this.current_list !== list) {
            this.updateCalendar()
        }
    }
    handleEventPositioned(arg) {
        arg.el.setAttribute("data-tip", arg.event.start.getHours() + ":" + ("0" + arg.event.start.getMinutes()).slice(-2) + "-" + arg.event.end.getHours() + ":" + ("0" + arg.event.end.getMinutes()).slice(-2) + ": " + arg.event.title);
        ReactTooltip.rebuild();
    }
    handleHighLight(className) {
        $(".Function li").removeClass("bg-primary")
        $(".Function li").removeClass("text-white")
        $(className).addClass("bg-primary")
        $(className).addClass("text-white")
    }
    componentDidMount() {
        this.getUser()
        //this.getDynamoUsers();
        //this.getFamily()
        $(".Function .PostLi").addClass("bg-primary")
        $(".Function .PostLi").addClass("text-white")
        this.updateCalendarMul()
        // this.interval = setInterval(() => this.checkDifferent(), 2000);

    }
    componentWillUnmount() {
        // clearInterval(this.interval);
    }

    render() {
        return (
            <>
                {this.checkUser()}
                <div className="User container-fluid p-0 m-0" style={{ height: '100vh' }}>
                    <div className="row m-0 h-100">
                        <div className="col-2 bg-white border-right pt-4 border-none d-flex justify-content-center">
                            <div className="Stick bg-white">
                                <p className="text-center pl-3 pr-3">{this.dispplayImage()}</p>
                                <p className="Username text-center">{this.state.user.username}</p>
                                <p className="text-center lead"><button type="button" className="btn btn-outline-primary" onClick={this.logout.bind(this)}>Logout</button></p>
                                <hr />
                                <ul className="Function list-group">
                                    <li className="ProfileLi list-group-item" key="profile" onClick={this.switchContent.bind(this, "profile")}>
                                        <img src={require("./imgs/profile.png")} alt="" width="25px" height="25px" /> Profile
                                </li>
                                    <li className="PostLi list-group-item" key="post" onClick={this.switchContent.bind(this, "post")}>
                                        <img src={require("./imgs/post.png")} alt="" width="25px" height="25px" /> Post
                                </li>
                                    <li className="CalendarLi list-group-item" key="calendar" onClick={this.switchContent.bind(this, "calendar")}>
                                        <img src={require("./imgs/event.png")} alt="" width="25px" height="25px" /> Calendar
                                </li>
                                    <li className="TodolistLi list-group-item" key="todolist" onClick={this.switchContent.bind(this, "todolist")}>
                                        <img src={require("./imgs/todolist.png")} alt="" width="25px" height="25px" /> To do list
                                </li>
                                    {/* <li className="ChatLi list-group-item" key="chat" onClick={this.switchContent.bind(this, "chat")}>
                                        Chat
                                </li> */}

                                </ul>
                            </div>
                        </div>
                        <div className="col-7">
                            {this.displayContent()}
                        </div>
                        <div className="col-3 ml-auto p-0 ">
                            <div className="StickRight">
                                <div className="ml-0 mt-4 mr-4 mb-2 p-4 bg-white border rounded">
                                    <div className="MiniCalendar" id="minicalendar"></div>
                                    <ReactTooltip effect="solid" type="info" />
                                </div>
                                <div className="ChatBox ml-0 mt-0 mr-4 mb-4 p-4 bg-white rounded border">
                                    {/* Chat here */}
                                    <Groupchat className="Chat"
                                        users={this.state.users}
                                        user={this.state.user}
                                        getUsers={this.getDynamoUsers.bind(this)}
                                        isAuthenticated={this.state.comet_login} />
                                </div>
                            </div>
                        </div>
                        {/* Switch ngay chỗ này */}
                        {/* <Post></Post> */}
                        {/* <Todolist></Todolist> */}
                    </div>
                </div>
            </>



        )
    }
}