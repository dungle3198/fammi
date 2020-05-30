import React, { Component } from 'react'
import $ from 'jquery';
import { ReactS3Client } from "./Data/s3";
import { docClient } from "./Data/user";
var bcrypt = require("bcryptjs");


export default class Profile extends Component {
    constructor(props) {
        super(props)

        this.state = {
            user: this.props.user,
            email: "",
            password: "",
            new_password: "",
            confirm_password: "",
            key: "",
            username: "",
            avatar: this.props.user.avatar
        }

    }
    handleChange(e) {
        let obj = {};
        obj[e.target.name] = e.target.value;
        this.setState(obj);
    }
    handleAvatar() {
        if (this.state.avatar !== "") {
            return this.state.avatar;
        }
        var img = require('./imgs/ava.jpg')
        return img
    }
    dispplayImage() {
        if (this.state.user !== null || this.state.user !== undefined) {
            return (<img className="Avatar border rounded-circle" src={this.handleAvatar()} alt="" width="150px" height="150px" />)
        }
    }
    getData(data) {
        this.setState({ avatar: data.location })
        document.getElementById("edit_avatar")
    }
    uploadImage() {
        var path = document.getElementById("edit_avatar").files[0].name; // get the image file name
        var string = path.split('.');
        //var filename = string[0]; // get the name without the type
        var extension = string[1];
        if (extension.toLowerCase() !== "jpg" && extension.toLowerCase() !== "png" && extension.toLowerCase() !== "jpeg" && extension.toLowerCase() !== "svg") {
            alert("invalid file format");
            return;
        }

        ReactS3Client
            .uploadFile(document.getElementById("edit_avatar").files[0]) // pload the image up to s3 first
            .then(data => { this.getData(data) })//create cometchat user
            .catch(err => console.error(err))
    }
    updateButton() {
        var u_name = this.state.user.username;
        var password = this.state.user.password;
        if (this.state.username !== "") {
            u_name = this.state.username;
        }
        if (this.state.password !== "") {
            password = bcrypt.hashSync(this.state.new_password, 10)
        }
        var params = {
            TableName: "users",
            Key: {
                "email": this.state.user.email,
            },
            UpdateExpression: "set password = :password, username = :username, avatar = :avatar",
            ExpressionAttributeValues: {
                ":password": password,
                ":username": u_name,
                ":avatar": this.state.avatar
            },
            ReturnValues: "UPDATED_NEW"
        };
        docClient.update(params, function (err, data) {

            if (err) {
                console.log("users::save::error - " + JSON.stringify(err, null, 2));
            } else {
                console.log("users::save::success");
                this.props.getUser();
            }
        }.bind(this));
    }
    updateAvatarButton() {
        var avatar = this.props.user.avatar;
        if (this.state.avatar === "") {
            alert("Please upload a new image file")
            return
        }
        avatar = this.state.avatar;
        var params = {
            TableName: "users",
            Key: {
                "email": this.state.user.email,
            },
            UpdateExpression: "set  avatar = :avatar",
            ExpressionAttributeValues: {
                ":avatar": avatar,
            },
            ReturnValues: "UPDATED_NEW"
        };
        docClient.update(params, function (err, data) {

            if (err) {
                console.log("users::save::error - " + JSON.stringify(err, null, 2));
            } else {
                console.log("users::save::success");
                this.props.getUser();
            }
        }.bind(this));
        $('#editAvatar').modal('hide')
    }
    updateUsernameButton() {
        var u_name = ""
        if (this.state.username === "") {
            alert("Please fill in the new username")
            return
        }
        u_name = this.state.username;
        var params = {
            TableName: "users",
            Key: {
                "email": this.state.user.email,
            },
            UpdateExpression: "set  username = :username",
            ExpressionAttributeValues: {
                ":username": u_name,
            },
            ReturnValues: "UPDATED_NEW"
        };
        docClient.update(params, function (err, data) {

            if (err) {
                console.log("users::save::error - " + JSON.stringify(err, null, 2));
            } else {
                console.log("users::save::success");
                this.props.getUser();
                var _user = this.state.user;
                _user.username = this.state.username
                this.setState({user:_user,username:""})
                //this.state.user.username = this.state.username;
            }
        }.bind(this));
        $('#editUserName').modal('hide')
    }
    updatePasswordButton() {
        var password = this.state.user.password;
        console.log(this.state.user);
        var newpassword = this.state.new_password;
        var confirm_password = this.state.confirm_password;

        if (!bcrypt.compareSync(this.state.password, password)) {
            alert("The current password is incorrect");
            return
        }
        if (newpassword === "") {
            alert("Please fill in the new password");
            return
        }
        if (confirm_password === "") {
            alert("Please confirm the password");
            return
        }
        if (confirm_password !== newpassword) {
            alert("Confirmed password does not match.")
            return
        }
        password = bcrypt.hashSync(this.state.new_password, 10)
        var params = {
            TableName: "users",
            Key: {
                "email": this.state.user.email,
            },
            UpdateExpression: "set password = :password",
            ExpressionAttributeValues: {
                ":password": password,
            },
            ReturnValues: "UPDATED_NEW"
        };
        docClient.update(params, function (err, data) {

            if (err) {
                console.log("users::save::error - " + JSON.stringify(err, null, 2));
            } else {
                console.log("users::save::success");
                alert("You have edited password successfully!")

                this.props.getUser();
                var _user = this.state.user;
                _user.password = password;
                
                this.setState({
                    user:_user,
                    password: "",
                    new_password: "",
                    confirm_password: "",

                })

            }
        }.bind(this));
        $('#editPass').modal('hide')
    }
    handleEditAvatar() {
        $('#editAvatar').modal('show')
    }
    handleEditUserName() {
        $('#editUserName').modal('show')
    }
    handleEditPass() {
        $('#editPass').modal('show')
    }
    componentDidMount() {
    }
    render() {
        return (
            <div className="Profile m-2 mt-4 border p-4 bg-white rounded">
                <div className="form-group-section">
                    <div className="text-center">
                        {this.dispplayImage()}
                        <p className="m-0 mt-1">{this.state.user.username}</p>
                        <div className="Name">
                            <small className="hover" onClick={this.handleEditAvatar.bind(this)}>Change Avatar</small>
                        </div>
                    </div>

                </div>
                <br />
                <div className="Info mx-auto form-group-section">
                    <p>Family Key: <span className="Name">{this.state.user.key}</span></p>
                    <p>Username: <span className="Name">{this.state.user.username}</span>  <small className="hover" onClick={this.handleEditUserName.bind(this)}>Edit</small></p>
                    <p>Password: <span className="Name">**********</span>  <small className="hover" onClick={this.handleEditPass.bind(this)}>Edit</small></p>
                </div>
                {/* <div className="form-group-section">
                        <label htmlFor="username">Username</label>
                        <input type="text"
                            className="form-control"
                            id="username"
                            placeholder={this.state.user.username}
                            name="username"
                            value={this.state.username}
                            onChange={this.handleChange.bind(this)} />
                        <br />
                        <div className="w-100 text-center">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={this.updateUsernameButton.bind(this)}
                            >Edit</button>
                        </div>
                        <br />
                    </div> */}
                {/* <div className="form-group-section">
                        <h1> PASSWORD</h1>
                        <label htmlFor="password">Password</label>
                        <input type="password"
                            className="form-control"
                            id="password"
                            placeholder="**********"
                            name="password"
                            value={this.state.password}
                            onChange={this.handleChange.bind(this)} />
                        <label htmlFor="password">New Password</label>
                        <input type="password"
                            className="form-control"
                            id="password"
                            placeholder="**********"
                            name="new_password"
                            value={this.state.new_password}
                            onChange={this.handleChange.bind(this)} />
                        <label htmlFor="password">Confirm Password</label>
                        <input type="password"
                            className="form-control"
                            id="password"
                            placeholder="**********"
                            name="confirm_password"
                            value={this.state.confirm_password}
                            onChange={this.handleChange.bind(this)} />
                    </div>  <br />
                    <div className="w-100 text-center">
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={this.updatePasswordButton.bind(this)}
                        >Edit</button>
                    </div> */}
                {/* <div className="form-group">
                        <label htmlFor="exampleInputEmail1">Key</label>
                        <select className="form-control" id="exampleFormControlSelect1">
                            <option>Generate new key</option>
                            <option>Aldready have key</option>
                        </select>
                        <input type="text"
                            className="form-control mt-2"
                            id="exampleInputKey1"
                            placeholder={this.state.user.key}
                            name="key"
                            value={this.state.key}
                            onChange={this.handleChange.bind(this)} />
                    </div> */}

                {/* Modal */}
                <div className="modal fade" id="editAvatar" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-body">
                                <input type="file"
                                    className="form-control"
                                    id="edit_avatar"
                                    name="avatar"
                                    onChange={this.uploadImage.bind(this)}
                                />
                                <p className="text-right m-0 mt-2">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={this.updateAvatarButton.bind(this)}
                                    >Submit</button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="editUserName" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-body">
                                <input type="text"
                                    className="form-control"
                                    id="username"
                                    placeholder={this.state.user.username}
                                    name="username"
                                    value={this.state.username}
                                    onChange={this.handleChange.bind(this)} />
                                <p className="text-right m-0 mt-2">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={this.updateUsernameButton.bind(this)}
                                    >Submit</button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="editPass" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-body">
                                <input type="password"
                                    className="form-control"
                                    id="password"
                                    placeholder="Current Password"
                                    name="password"
                                    value={this.state.password}
                                    onChange={this.handleChange.bind(this)} />
                                <input type="password"
                                    className="form-control mt-2"
                                    id="password"
                                    placeholder="New Password"
                                    name="new_password"
                                    value={this.state.new_password}
                                    onChange={this.handleChange.bind(this)} />
                                <input type="password"
                                    className="form-control mt-2"
                                    id="password"
                                    placeholder="New Password"
                                    name="confirm_password"
                                    value={this.state.confirm_password}
                                    onChange={this.handleChange.bind(this)} />

                                <p className="text-right m-0 mt-2">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={this.updatePasswordButton.bind(this)}
                                    >Edit</button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        )
    }
}


