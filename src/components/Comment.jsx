import React, { Component } from 'react'
import $ from 'jquery';
import { docClient } from './Data/comment'
import { v4 as uuidv4 } from 'uuid'; // For version 4
export default class Comment extends Component {
    constructor(props) {
        super(props)

        this.state = {
            comments: [],
            content: "",
            selected_comment: {
                comment_id: "",
                content: "",
                post_id: "",
                user: "",
                time: Date.now()
            },
            edit_comment: ""

        }
    }
    handleChange(e) {
        let obj = {};
        obj[e.target.name] = e.target.value;
        this.setState(obj);
        //console.log(user_list)
    }
    //#region for comment section
    getComments() {
        var params = {
            TableName: "comment",
            FilterExpression: "#cg = :post_id",
            ExpressionAttributeNames: {
                "#cg": "post_id",
            },

            ExpressionAttributeValues: {
                ":post_id": this.props.post_id,
            }
        };
        docClient.scan(params, function (err, data) {
            if (err) {
                // for the log in server
                //console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
            }
            else {

                var array = data.Items;
                array.sort((a, b) => {
                    return a.time - b.time;
                })
                this.setState({ comments: array });

            }
        }.bind(this));

    }
    createComment() {
        var time = Date.now();
        var comment_id = uuidv4();
        var content = this.state.content;
        var post_id = this.props.post_id;
        var poster = this.props.poster;
        var input = {
            "comment_id": comment_id,
            "content": content,
            "post_id": post_id,
            "user": poster,
            "time": time,
            "edit_time": ""

        };
        var params = {
            TableName: "comment",
            Item: input
        };
        docClient.put(params, function (err, data) {

            if (err) {
                console.log("users::save::error - " + JSON.stringify(err, null, 2));
            } else {
                console.log("users::save::success");
                this.getComments();
            }
        }.bind(this))
        this.setState({ content: "" })
        //this.getCommentsMul()
        //this.showAllComments()
    }
    //#endregion



    editable(comment) {
        if (this.props.poster.email === comment.user.email) {
            return <>
                <span> </span>
                <span id={comment.comment_id}
                    data-toggle="modal" data-target="#editComment"
                    onClick={this.handleClick.bind(this)}><small className="hover" id={comment.comment_id}>Edit</small></span>
                {/* Chỉnh khúc này nha anh delete nènè */}
                <span><small> | </small></span>
                <span id={comment.comment_id}
                    onClick={this.deleteFunction.bind(this)}><small className="hover" id={comment.comment_id}>Delete</small></span>
                {this.editForm(comment)}
            </>
        }
    }
    editForm(comment) {
        $("#editComment").on("hide.bs.modal", function () {
            this.setState({ edit_comment: "" })
        }.bind(this))
        return <div className="modal fade" id="editComment" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-body">
                        <input type="text" className="form-control"
                            placeholder={this.state.selected_comment.content}
                            value={this.state.edit_comment}
                            onChange={this.handleChangeEdit_Comment.bind(this)}
                        />
                        <p className="text-right m-0">
                            <button id={comment.comment_id}
                                type="button"
                                className="btn btn-primary mt-2"
                                onClick={this.editButton.bind(this)}>Edit</button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    }
    deleteFunction(e) {
        var id = e.target.id;
        var params = {
            TableName: "comment",
            Key: {
                "comment_id": id,
            }
        };
        docClient.delete(params, function (err, data) {
            if (err) {
                console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                this.getComments();
                console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
            }
        }.bind(this));
    }
    handleClick(e) {
        //console.log(e.target.id);
        var select = this.state.comments.find((a) => {
            return a.comment_id === e.target.id;
        })
        if (select !== undefined) {
            this.setState({ selected_comment: select })
        }
    }
    handleChangeContent(e) {
        var content = e.target.value;
        var select = this.state.selected_comment;
        select.content = content;
        this.setState({ selected_comment: select });
    }
    handleChangeEdit_Comment(e) {
        var content = e.target.value;
        this.setState({ edit_comment: content });
    }
    editButton() {
        var comment = ""
        if (this.state.edit_comment !== "") {
            comment = this.state.edit_comment;
        }
        else {
            comment = this.state.selected_comment.content;
        }
        var params = {
            TableName: "comment",
            Key: {
                "comment_id": this.state.selected_comment.comment_id,

            },
            UpdateExpression: "set content = :content, edit_time = :edit_time",
            ExpressionAttributeValues: {
                ":content": comment,
                ":edit_time": Date.now()
            },
            ReturnValues: "UPDATED_NEW"
        };
        docClient.update(params, function (err, data) {

            if (err) {
                //console.log("users::save::error - " + JSON.stringify(err, null, 2));
            } else {
                //console.log("users::save::success");

                this.getComments();
                //this.props.getpost(this.state.selected_comment.post_id);

            }
        }.bind(this));
        $('#editComment').modal('hide')
    }
    handleAvatar(user) {
        var u = this.props.users.find((value) => {
            return value.email === user.email
        })
        if (u === undefined) {
            return require('./imgs/ava.jpg');
        }
        if (u.avatar !== "") {
            return u.avatar;
        }
        return require('./imgs/ava.jpg');
    }
    handleTitle(user) {
        var u = this.props.users.find((value) => {
            return value.email === user.email
        })
        if (u === undefined) {
            return user.username;
        }
        return u.username

    }
    handleEdit_Time(comment) {
        if (comment.edit_time !== "") {
            //console.log("edited is real")
            return " Edited on " + new Date(comment.edit_time).toString().substr(16, 5) + " " + new Date(comment.edit_time).toString().substr(4, 11)
        }
        else {
            return " Created on " + new Date(comment.time).toString().substr(16, 5) + " " + new Date(comment.time).toString().substr(4, 11)
        }
    }
    handlestring_length(comment, type) {
        var length_per_row = this.props.length_per_row;
        var length = comment.content.length;
        if (comment.content.match(/m/g) !== null){
            length = length + comment.content.match(/m/g).length
        }
        //console.log("There are" + length+" chars in this line");
        if (comment.content === "") {
            return 0
        }
        if (type === "row") {

            var rows = Math.ceil(length / length_per_row)
            //console.log("there are " +rows +" rows") 
            return rows
        }
        if (type === "col") {
            if (length < length_per_row) {
                //console.log("low amount")
                return length;
            }
            return length_per_row;
        }
        return 1
    }
    componentDidMount() {
        this.getComments()
    }
    showAllComments() {
        if (this.state.comments !== undefined) {
            return (<>
                {this.state.comments.map((comment, index) => {
                    return (
                        <div key={index} className="comment">
                            <div className="row m-1">
                                <div className="col-auto p-0">
                                    <img alt={comment.user.avatar}
                                        className="border rounded-circle mt-2"
                                        src={this.handleAvatar(comment.user)}
                                        width="40px" height="40px" />
                                </div>
                                <div className="col p-0">
                                    <div className="d-flex">
                                        <p className="line m-0 pl-2 pr-2">
                                            <span>{this.handleTitle(comment.user)}</span>
                                        </p>
                                    </div>
                                    <textarea className="ml-2 mr-2 content noInput"
                                        rows={this.handlestring_length(comment, "row")}
                                        cols={this.handlestring_length(comment, "col")}
                                        value={comment.content} readOnly>
                                    </textarea>
                                    <p className="CommentTime p-0 pl-2">
                                        <small>{this.handleEdit_Time(comment)}</small>{this.editable(comment)}
                                    </p>

                                </div>
                            </div>

                        </div>)
                })}
            </>)
        }

    }
    render() {
        return (
            <div className="Comment m-2">
                {this.showAllComments()}
                <div className="row w-100 m-0">
                    <div className="commentbox col m-0 p-0">
                        <input type="text"
                            className="form-control"
                            name="content"
                            id={this.props.post_id}
                            placeholder="Comment"
                            onChange={this.handleChange.bind(this)}
                            value={this.state.content} />

                    </div>
                    <div className="col-auto p-0 pl-2">
                        <button type="button" className="btn btn-primary" onClick={this.createComment.bind(this)}>Comment</button>
                    </div>
                </div>


            </div>
        )
    }
}
