import React, { Component } from 'react'
import $ from 'jquery';

export default class ChatBox extends Component {
    handleClick(){
        console.log("hello")
        if(document.getElementById("ChatBox").style.display === "none"){
            document.getElementById("ChatBox").style.display = "block";
            $("#ChatBoxTitle").addClass("rounded-top")
            $("#ChatBoxTitle").removeClass("rounded")
        }
        else{
            document.getElementById("ChatBox").style.display = "none";
            $("#ChatBoxTitle").removeClass("rounded-top")
            $("#ChatBoxTitle").addClass("rounded")
        }
    }
    componentDidMount(){
        document.getElementById("ChatBox").style.display = "none";
    }
    render() {
        return (
            <div className="ChatBox border rounded">
                <div id="ChatBoxTitle" className="title bg-primary text-white rounded border-bottom"> <p className="text-center m-0" onClick = {this.handleClick.bind(this)}>Group Chat</p> </div>
                <div id="ChatBox" className="chat bg-white p-0 m-0">
                    {/* Put chat here */}
                </div>
            </div>
        )
    }
}
