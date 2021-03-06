import React, { Component } from 'react'
import { docClient } from "./Data/user";
import { createFamily, joinFamily, family_list } from "./Data/family";
import { create_cometchat_user } from './Data/cometchatuser'
// import { ReactS3Client } from "./Data/s3";
import Navbar from "./Navbar";
import { Redirect } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'; // For version 4
import $ from 'jquery';
var bcrypt = require("bcryptjs");
var cookie = require("js-cookie");

export default class Home extends Component {

    constructor(props) {
        super(props)
        this.state = {

            userlist: {},
            email: "",
            password: "",
            key: "",
            username: "",
            avatar: "",
            hasKey: false
        }
        
    }
    checkUser() {
        console.log("checking user")
        var email = cookie.get("email");
        //alert(email)
        if (email !== undefined) {
            return <Redirect to="/user" />
        }
    }
    handleFamilyKey(email) {
        var fam = family_list.find((e) => { return e.family_key === this.state.key });
        if (this.state.hasKey) {
            if (fam !== undefined) {
                fam.members.push(email)
                joinFamily(this.state.key, fam.members);
                this.setState({
                    email: "",
                    password: "",
                    key: "",
                    username: "",
                    avatar: "",
                    hasKey: false
                })
                
                return true;

            }
            alert("Invalid Family Key");
            return false
        }
        else {
            if (fam === undefined) {
                var members = []
                members.push(email);
                createFamily(this.state.key, members)
                return true;
            }
            alert("Existed Family Key");
            return false
        }
        //return false;
        // if (fam === undefined) {
        //     console.log("you created a family");
        //     var members = []
        //     members.push(email);
        //     createFamily(this.state.key, members)
        //     return;
        // } else {
        //     console.log("you joined a family");
        //     fam.members.push(email)
        //     joinFamily(this.state.key, fam.members);
        //     return;
        // }
    }
    keySelection(e) {
        if (e.target.value === "has") {
            console.log("you have a key already");
            this.setState({ hasKey: true })
        }
        else {
            console.log("you dont have a key");
            this.setState({ hasKey: false })
        }
    }
    signUp(e) {
        if (this.state.user_list.find(u => u.email === this.state.email) === undefined) {
            function validateEmail(email) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
            }
            if (validateEmail(this.state.email) === true && this.handleFamilyKey()) {
                var hashed = bcrypt.hashSync(this.state.password, 10) // hashing password
                var commet_id = "user" + uuidv4();

                this.createUser(this.state.email, hashed, this.state.key, this.state.username, "", commet_id)// then create it 
                create_cometchat_user(this.state.email, commet_id, "https://unknown2020.s3-ap-southeast-1.amazonaws.com/ava.jpg", this.state.key)
                this.handleFamilyKey(this.state.email)
                $('#signupModal').modal('hide')
                return (<Redirect to={"/"} />)
                // if (document.getElementById("avatar").files[0] === undefined) {
                //     createUser(this.state.email, hashed, this.state.key, this.state.username, "", commet_id)// then create it 
                //     create_cometchat_user(this.state.email, commet_id, "https://unknown2020.s3-ap-southeast-1.amazonaws.com/ava.jpg", this.state.key)
                //     this.handleFamilyKey(this.state.email)
                //     return (<Redirect to={"/"} />)
                // }
                // var path = document.getElementById("avatar").files[0].name; // get the image file name
                // var filename = path.split('.')[0]; // get the name without the type

                // ReactS3Client
                //     .uploadFile(document.getElementById("avatar").files[0], filename) // pload the image up to s3 first
                //     .then(data => {
                //         createUser(this.state.email, hashed, this.state.key, this.state.username, data.location, commet_id)// then create it 
                //         create_cometchat_user(this.state.email, commet_id, data.location, this.state.key)
                //         this.handleFamilyKey(this.state.email)
                //     })//create cometchat user
                //     .then(alert("You have signed up successfully!"))
                //     .catch(err => console.error(err))


                //createUser(this.state.email, hashed, this.state.key, this.state.username)
                //setTimeout(e, 1000)
                //alert("You have successfully signed up")
            }
            return
        }
        else if (this.state.user_list.find(u => u.email === this.state.email) !== undefined) {
            alert("This email address has been used for another account")
            return
        }
        alert("Invalid email address")
    }
    login(e) {
        if (this.state.user_list.find(u => u.email === this.state.email) !== undefined) {
            var user = this.state.user_list.find(u => u.email === this.state.email)
            if (bcrypt.compareSync(this.state.password, user.password)) {

                var check_box = document.getElementById("exampleCheck1")
                if (check_box) {
                    if (check_box.checked) {
                        cookie.set("email", user.email)
                        //alert(cookie.get("email"))
                        cookie.set("username", user.username)
                    }
                    else {
                        cookie.set("email", user.email, { expires: 1 / 24 })
                        //alert(cookie.get("email"))
                        cookie.set("username", user.username, { expires: 1 / 24 })
                    }
                }
                this.props.loginFunction(user);
                alert("You have logged in successfully.")
                return
            }
        }
        alert("Incorrect email or password")
    }
    handleAvatar() {
        if (this.state.avatar !== "") {
            return this.state.avatar;
        }
        return require('./imgs/ava.jpg');
    }
    displayAvatar() {
        return <img src={this.handleAvatar()} alt="" width="150px" height="150px" />
    }
    handleChange(e) {
        let obj = {};
        obj[e.target.name] = e.target.value;
        this.setState(obj);
        //console.log(user_list)
    }
    createUser (email, password, key, username,avatar,comet_id) {
        var input = {
            "email": email,
            "password": password,
            "key": key,
            "username": username,
            "avatar": avatar,
            "comet_uid": comet_id
        };
        var params = {
            TableName: "users",
            Item: input
        };
        docClient.put(params, function (err, data) {
    
            if (err) {
                console.log("users::save::error - " + JSON.stringify(err, null, 2));
            } else {
                console.log("users::save::success");
                this.getAllUsers();
                alert("you have successfully signed up")
            }
        }.bind(this))
        
    }
    getAllUsers (){
        var params = {
            TableName: "users"
        };
        
        docClient.scan(params, function(err, data){
            if (err) 
            {
                console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
            } 
            else {
                //console.log("Scan succeeded.");
                var users = JSON.parse(JSON.stringify(data.Items))
                this.setState({user_list:users})
            }
        }.bind(this));
        
    };
    componentDidMount() {
        this.getAllUsers();
    }

    render() {
        return (
            <>
                {this.checkUser()}
                <div className="Home bg-transparent">
                    <Navbar />

                    {/* Jumbotron */}
                    <div className="Background bg-white m-0 p-4">
                        <div className="Smaller w-100 row border m-0 rounded">
                            <div className="col-3 bg-white p-4 d-flex align-items-center rounded-left">
                                <ul className="list-unstyled w-100">
                                    <li className="lead pl-3">Post Story</li>
                                    <li className="lead mt-2 pl-3">Share Event</li>
                                    <li className="lead mt-2 pl-3">Add to-do list</li>
                                    <p className="text-center m-0">
                                        <br />
                                        <button type="button" className="btn btn-primary text-white mt-1" data-toggle="modal" data-target="#signupModal">Sign up now</button>
                                        <br />
                                        <button type="button" className="btn btn-outline-primary mt-1" data-toggle="modal" data-target="#loginModal">Or login.</button>
                                    </p>

                                </ul>
                            </div>
                            <div className="col-9 p-0 rounded-right">
                                <img className="Img rounded-right" src={require('./imgs/home.jpg')} alt="" width="100%" />
                            </div>
                        </div>
                    </div>
                    {/* Signup */}
                    <div className="modal fade" id="signupModal" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <p className="modal-title lead" id="exampleModalLabel">Signup</p>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">×</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    {/* Form */}
                                    <form>
                                        {/* <div className="form-group">
                                            <label htmlFor="name">Avatar: </label>
                                            <div>{this.displayAvatar()}</div>
                                            <input type="file"
                                                className="form-control"
                                                id="avatar"
                                                name="avatar"
                                                value={this.state.avatar}
                                                onChange={this.handleChange.bind(this)}
                                            />
                                        </div> */}
                                        <div className="form-group">
                                            <label htmlFor="exampleInputEmail2">Email address</label>
                                            <input type="email"
                                                className="form-control"
                                                id="exampleInputEmail2"
                                                aria-describedby="emailHelp"
                                                placeholder="Enter email"
                                                name="email"
                                                value={this.state.email}
                                                onChange={this.handleChange.bind(this)} />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="exampleInputUsername3">Username</label>
                                            <input type="text"
                                                className="form-control"
                                                id="exampleInputEmail3"
                                                placeholder="Enter username"
                                                name="username"
                                                value={this.state.username}
                                                onChange={this.handleChange.bind(this)} />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="exampleInputPassword1">Password</label>
                                            <input type="password"
                                                className="form-control"
                                                id="exampleInputPassword1"
                                                placeholder="Password"
                                                name="password"
                                                value={this.state.password}
                                                onChange={this.handleChange.bind(this)} />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="exampleInputPassword2">Comfirm Password</label>
                                            <input type="password"
                                                className="form-control"
                                                id="exampleInputPassword2"
                                                placeholder="Password"
                                                onChange={this.handleChange.bind(this)} />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="exampleInputEmail1">Key</label>
                                            <select className="form-control" id="exampleFormControlSelect1" onChange = {this.keySelection.bind(this)}>
                                                <option value ={"not"}>Generate new key</option>
                                                <option value ={"has"}>Already have key</option>
                                            </select>
                                            <input type="text"
                                                className="form-control mt-2"
                                                id="exampleInputKey1"
                                                placeholder="Enter key"
                                                name="key"
                                                value={this.state.key}
                                                onChange={this.handleChange.bind(this)} />
                                        </div>
                                        <br />
                                        <div className="w-100 text-center">
                                            <button
                                                type="button"
                                                className="btn btn-primary w-75"
                                                onClick={this.signUp.bind(this)}>Signup</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Login */}
                    <div className="modal fade" id="loginModal" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <p className="modal-title lead" id="exampleModalLabel">Login</p>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">×</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    {/* Form */}
                                    <form>
                                        <div className="form-group">
                                            <label htmlFor="exampleInputEmail1">Email address</label>
                                            <input type="email"
                                                className="form-control"
                                                id="exampleInputEmail1"
                                                aria-describedby="emailHelp"
                                                placeholder="Enter email"
                                                name="email"
                                                value={this.state.email}
                                                onChange={this.handleChange.bind(this)} />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="exampleInputPassword3">Password</label>
                                            <input type="password"
                                                className="form-control"
                                                id="exampleInputPassword3"
                                                placeholder="Password"
                                                name="password"
                                                value={this.state.password}
                                                onChange={this.handleChange.bind(this)} />
                                        </div>
                                        <div className="form-check">
                                            <input type="checkbox"
                                                className="form-check-input"
                                                id="exampleCheck1" />
                                            <label className="form-check-label" htmlFor="exampleCheck1">Save password</label>
                                        </div>
                                        <br />
                                        <div className="w-100 text-center">

                                            <button
                                                type="button"
                                                className="btn btn-primary w-75"
                                                onClick={this.login.bind(this)}
                                                data-dismiss="modal">Continue</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>

        )
    }
}
