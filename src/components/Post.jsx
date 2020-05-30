import React, { Component } from 'react'
import $ from 'jquery';
import { createPost, updatePost_Content, updatePost_Img, updatePost_Time, deletePost, docClient } from "./Data/post";
import { create_post_family } from './Data/family';
// import { user_list } from './Data/user';
import { ReactS3Client } from "./Data/s3";
import Comment from "./Comment.jsx";
// import ChatBox from "./ChatBox";

export default class Post extends Component {
    constructor(props) {
        super(props)
        this.state = {
            post_list: [],
            content: "",
            selected_post: {},
            selected_content: "",
            id: "",
            img: "",
            selected_img: "no-img",
            click: 0,
            comment_list: [],
            uploaded_img: "no-img"
        }
    }
    clearForm() {
        this.setState({
            content: "",
            uploaded_img: "no-img",
            selected_img: ""
        })
    }
    checkForm() {
        if (this.state.selected_content === "") {
            alert("Content to be filled")
            return false
        }
        return true
    }
    handleChange(e) {
        //console.log(e.target.value)
        let obj = {};
        obj[e.target.name] = e.target.value;
        this.setState(obj);
    }
    handleUploadImg() {
        var path = document.getElementById("img").files[0].name; // get the image file name
        var filename = path.split('.')[0]; // get the name without the type
        ReactS3Client
            .uploadFile(document.getElementById("img").files[0], filename) // pload the image up to s3 first
            .then(data => {
                this.setState({
                    uploaded_img: data.location
                })
            })//create cometchat user
            .catch(err => console.error(err))
    }
    handleUploadImgEdit() {
        var path = document.getElementById("imgedit").files[0].name; // get the image file name
        var filename = path.split('.')[0]; // get the name without the type
        ReactS3Client
            .uploadFile(document.getElementById("imgedit").files[0], filename) // pload the image up to s3 first
            .then(data => {
                this.setState({
                    selected_img: data.location
                })
            })//create cometchat user
            .catch(err => console.error(err))
    }
    handleCreate() {
        createPost(this.state.content, this.props.user.key, this.props.user, this.state.uploaded_img)
        var list = this.props.family.posts;
        var post_input = {
            user: this.props.user.username,
            content: this.state.content,
            img: this.state.uploaded_img,
            time: Date.now()
        }
        list.push(post_input);
        create_post_family(this.props.family.family_key, list);
        this.clearForm()
        this.updatePostMul()
    }
    handleClick(e) {
        this.setState({
            id: e.target.id
        })
        this.getPostbyidMul(e.target.id)
    }
    handleEdit() {
        if (this.checkForm() === true) {
            updatePost_Content(this.state.id, this.state.selected_content)
            updatePost_Time(this.state.id, Date.now())
            updatePost_Img(this.state.id, this.state.selected_img)
            $('#editPost').modal('hide')
            this.updatePostMul()
        }
    }
    handleDelete(e) {
        var confirm_box = window.confirm("Do you want to delete the post.");
        if (confirm_box === true) {
            deletePost(e.target.id)
            $('#editPost').modal('hide')
            this.updatePostMul()
        }

    }
    handleRemove() {
        var confirm_box = window.confirm("Do you want to remove the image.");
        if (confirm_box === true) {
            updatePost_Img(this.state.id, "no-img")
            this.updatePostMul()
        }
    }
    updatePost() {
        var params = {
            TableName: "posts"
        };

        docClient.scan(params, function onScan(err, data) {

            if (err) {
                // console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                //console.log("Scan succeeded.");
                var post_list = JSON.parse(JSON.stringify(data.Items))
                post_list.sort((a, b) => b.time - a.time)
                this.setState({
                    post_list: post_list
                })
                //console.log(post_list)
            }
        }.bind(this));


    }
    updatePostMul() {
        this.updatePost()

    }
    getPostbyid(id) {
        var params = {
            TableName: "posts",
            Key: {
                "post_id": id
            }
        };
        docClient.get(params, function (err, data) { // Đây là khúc nó bắt đầu fetch data 
            if (err) {
                console.log("users::fetchOneByKey::error - " + JSON.stringify(err, null, 2)); // => This is when the fetching failed
            }
            else { // Nếu data lấy về thành công thì nó sẽ trở thành cái object mà e muốn
                var post = data.Item;
                // console.log(post)
                this.setState({
                    selected_post: post,
                    selected_content: this.state.selected_post.content,
                    selected_img: this.state.selected_post.img
                });
                // console.log("users::fetchOneByKey::success - " + JSON.stringify(data, null, 2)); ==> This is when the fetching success
            }
        }.bind(this))
    }


    getPostbyidMul(id) {
        this.getPostbyid(id)
        setTimeout(
            function () {
                this.getPostbyid(id)
                $('#editPost').modal('show')
            }
                .bind(this),
            500
        );
        setTimeout(
            function () {
                this.getPostbyid(id)
                $('#editPost').modal('show')
            }
                .bind(this),
            1000
        );
        setTimeout(
            function () {
                this.getPostbyid(id)
                $('#editPost').modal('show')
            }
                .bind(this),
            1500
        );
    }
    componentDidMount() {
        this.updatePostMul()
    }
    getAvatar(user_email) {
        var _u = this.props.users.find((e) => { return e.email === user_email });
        if (_u !== undefined) {
            if (_u.avatar !== "") {
                return _u.avatar;
            }
        }
        return require('./imgs/ava.jpg')
    }
    getName(user_email) {
        var _u = this.props.users.find((e) => { return e.email === user_email });
        if (_u !== undefined) {
            return _u.username
        }
        return "Username"

    }
    handleEdit_Time(post) {
        if (post.edit_time !== "") {
            //("edited is real")
            return " Edited on " + new Date(post.edit_time).toString().substr(16, 5) + " " + new Date(post.edit_time).toString().substr(4, 11)
        }
        else {
            return " Created on " + new Date(post.time).toString().substr(16, 5) + " " + new Date(post.time).toString().substr(4, 11)
        }
    }
    handlestring_length(post, type) {
        var length_per_row = Math.floor(($("#createPost").width()-6)/8.4) ;
        // console.log(length_per_row)
        var length = post.content.length;

        //console.log("There are" + length + " chars in this line");
        if (post.content === "") {
            return 0
        }
        if (type === "row") {

            var rows = Math.ceil(length / length_per_row)
            //console.log("there are " + rows + " rows")
            return rows
        }
        if (type === "col") {
            if (length < length_per_row) {
                //console.log("low amount")
                return length;
            }
            return length_per_row;
        }

    }
    render_img_video(url) {
        if (url !== undefined) {
            if (url === "no-img") {

            }
            else if (url.slice(-3) === "mp4") {
                return (<>
                    <p className="text-center pr-3 pl-3 pb-3 pt-1">
                        <video className="Video" controls>
                            <source src={url} type="video/mp4" />
                    Your browser does not support HTML video.
                </video>
                    </p>
                </>)
            }
            else {
                return (<>
                    <p className="text-center pr-3 pl-3 pb-3 pt-1">
                        < img className="Image" src={url} alt="" />
                    </p>
                </>)
            }
        }
    }
    handleX() {
        this.setState({
            uploaded_img: "no-img"
        })
    }
    render_img_video_create(url) {
        if (url !== undefined) {
            if (url === "no-img") {

            }
            else if (url.slice(-3) === "mp4") {
                return (<>
                    <p className="text-center pr-3 pl-3 pb-11 pt-1">
                        <span className="CloseBtn close closeImg" onClick={this.handleX.bind(this)}>×</span>
                        <video className="Video" controls>
                            <source src={url} type="video/mp4" />
                    Your browser does not support HTML video.
                    </video>
                    </p>
                </>)
            }
            else {
                return (<>
                    <p className="text-center pr-3 pl-3 pb-1 pt-1">
                        <span className="CloseBtn close closeImg" onClick={this.handleX.bind(this)}>×</span>
                        < img className="Image HoverShadow" src={url} alt="" />
                    </p>
                </>)
            }
        }
    }
    handleXedit() {
        this.setState({
            selected_img: "no-img"
        })
    }
    render_img_video_edit(url) {
        if (url !== undefined) {
            if (url === "no-img") {

            }
            else if (url.slice(-3) === "mp4") {
                return (<>
                    <p className="text-center pr-3 pl-3 pb-11 pt-1">
                        <span className="CloseBtn close closeImg" onClick={this.handleXedit.bind(this)}>×</span>
                        <video className="Video" controls>
                            <source src={url} type="video/mp4" />
                    Your browser does not support HTML video.
                    </video>
                    </p>
                </>)
            }
            else {
                return (<>
                    <p className="text-center pr-3 pl-3 pb-1 pt-1">
                        <span className="CloseBtn close closeImg" onClick={this.handleXedit.bind(this)}>×</span>
                        < img className="Image HoverShadow" src={url} alt="" />
                    </p>
                </>)
            }
        }
    }
    editable(post) {
        if (this.props.user.email === post.user.email) {
            return <div className="ml-auto"> <span id={post.post_id} onClick={this.handleClick.bind(this)}> <small className="hover" id={post.post_id}>Edit</small></span> <span><small>|</small></span> <span id={post.post_id} onClick={this.handleDelete.bind(this).bind(this)}> <small className="hover" id={post.post_id}>Delete</small></span> </div>
        }
    }
    showPost() {
        return (<>
            {this.state.post_list.map((post, index) => {
                if (post.family_key === this.props.user.key) {
                    return <div key={index} className="mb-2">
                        <div className="post w-100 m-0 p-4 border rounded bg-white">
                            <div className="title pt-2 pb-2 border-bottom">
                                <div className="row w-100 ml-2 mr-2">
                                    <div className="Avatar col-auto p-0"><img className="rounded-circle border" src={this.getAvatar(post.user.email)} alt="Generic placeholder" width="50px" height="50px" /></div>
                                    <div className="col pr-0">
                                        <div className="d-flex"><p className="m-0">{this.getName(post.user.email)}</p> {this.editable(post)}</div>
                                        <p className="m-0"><small>
                                            {this.handleEdit_Time(post)}
                                        </small>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <textarea className="PostContent noInput pl-3 pr-3" readOnly
                                rows={this.handlestring_length(post, "row")}
                                cols={this.handlestring_length(post, "col")}
                                value={post.content}
                                >

                            </textarea>
                            {this.render_img_video(post.img)}
                            <hr />
                            <Comment getpost={this.getPostbyid.bind(this)}
                                post_id={post.post_id}
                                poster={this.props.user}
                                users={this.props.users} 
                                length_per_row = {Math.floor(($("#createPost").width()-96)/8.4)}/>

                        </div>

                    </div>
                }
                return null
            })}
        </>)
    }
    render() {
        return (
            <div>
                <div className="Post mt-4 mr-2 mb-2 ml-2 border rounded bg-white p-4">
                    <textarea id="createPost" type="text" className="form-control mb-2" placeholder="Share your story." name="content" value={this.state.content} onChange={this.handleChange.bind(this)} />
                    {this.render_img_video_create(this.state.uploaded_img)}
                    <div className="d-flex">
                        <span className="ml-auto">
                            <div className="upload-btn-wrapper">
                                <button className="btn btn-success">Upload Image/Video</button>
                                <input type="file"
                                    className="file"
                                    id="img"
                                    name="img"
                                    value={this.state.img}
                                    onChange={this.handleUploadImg.bind(this)}
                                />
                            </div>
                        </span>
                        <span className="ml-2">
                            <button type="button" className="btn btn-primary" onClick={this.handleCreate.bind(this)}>Post</button>
                        </span>
                    </div>
                </div>
                <div className="Post m-2 m-0">
                    {this.showPost()}
                </div>
                <div className="modal fade" id="editPost" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="Modal modal-body">
                                <input type="text" className="form-control mb-2" name="selected_content" value={this.state.selected_content || ""} onChange={this.handleChange.bind(this)} />
                                {this.render_img_video_edit(this.state.selected_img)}
                                <div className="d-flex">
                                    <span className="ml-auto">
                                        <div className="upload-btn-wrapper">
                                            <button className="btn btn-success">Upload Image/Video</button>
                                            <input type="file"
                                                className="file"
                                                id="imgedit"
                                                // name="img"
                                                // value={this.state.selected_img}
                                                onChange={this.handleUploadImgEdit.bind(this)}
                                            />
                                        </div>
                                    </span>
                                    <span className="ml-2">
                                        <button type="button" className="btn btn-primary" onClick={this.handleEdit.bind(this)}>Submit</button>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}