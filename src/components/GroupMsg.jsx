import React from "react";
import chat from "./Messenger";


var request = require('request')
class Groupchat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            receiverID: "",
            messageText: "",
            groupMessage: [],
            othergroup: [],
            user: {},
            isAuthenticated: false
        };
        this.GUID = this.props.user.key;
        this.authenticateFunction();
    }

    authenticateFunction = () => {
        if (!this.state.isAuthenticated) {
            if (this.props.isAuthenticated) {
                chat.Login(this.props.user.comet_uid);
                this.getUser()
                this.getGroupMessage()
                this.setState({ isAuthenticated: this.props.isAuthenticated })
                return
            }
        }
        return
    }
    sendMessage = () => {
        chat.sendGroupMessage(this.GUID, this.state.messageText).then(
            message => {
                console.log("Message sent successfully:", message);
                this.setState({ messageText: null });
            },
            error => {
                if (error.code === "ERR_NOT_A_MEMBER") {
                    chat.joinGroup(this.GUID).then(response => {
                        this.sendMessage();
                    });
                }
            }
        );
    };
    scrollToBottom = () => {
        const chat = document.getElementById("chatList");
        chat.scrollTop = chat.scrollHeight;
    };
    handleSubmit = event => {
        event.preventDefault();
        this.sendMessage();
        event.target.reset();
    };
    handleChange = event => {
        this.setState({ messageText: event.target.value });
    };

    getUser = () => {
        chat
            .getLoggedinUser()
            .then(user => {
                console.log("user details:", { user });
                this.setState({ user: user });
            })
            .catch((error) => {
                if (error.code === "USER_NOT_LOGED_IN") {
                    this.setState({
                        isAuthenticated: false
                    });
                }
            });
    };
    messageListener = () => {
        chat.addMessageListener((data, error) => {
            if (error) return console.log(`error: ${error}`);
            //console.log(data)

            this.getGroupMessage();
            this.scrollToBottom();
            //this.getGroupMessage()
        });
    };
    sendMessageButton() {
        var options = {
            method: 'POST',
            url: 'https://api-us.cometchat.io/v2.0/users/' + this.props.user.comet_uid + '/messages',
            headers: {
                appid: '179356b6e66895b',
                apikey: 'fae743651e432f171ee21ba834d8af048bd9e841',
                'content-type': 'application/json',
                accept: 'application/json'
            },
            body: '{"receiver":"' + this.props.user.key + '","receiverType":"group","category":"message","type":"text","data":{"text":"' + this.state.messageText + '","metadata":{"key1":"value1","key2":"value2"}}}'

        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            this.getGroupMessage()
        }.bind(this))
    }
    getGroupMessage() {
        var options = {
            method: 'GET',
            url: 'https://api-us.cometchat.io/v2.0/users/' + this.props.user.comet_uid + '/groups/' + this.props.user.key + '/messages',
            headers: {
                appid: '179356b6e66895b',
                apikey: 'fae743651e432f171ee21ba834d8af048bd9e841',
                'content-type': 'application/json',
                accept: 'application/json'
            }
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            var u = body;
            JSON.stringify(u);
            var array = JSON.parse(u).data
            if (array !== undefined) {
                this.setState(({
                    groupMessage: array,
                    messageText: ""
                }),
                    () => {
                        this.scrollToBottom();
                    }
                );
            }
        }.bind(this));

    }
    testComponent() {
        this.state.groupMessage.forEach(element => {
            if (element.data.entities.sender !== undefined) {
                console.log(element.data.entities.sender.entity);
            }
        }
        )
    }
    handleAvatar(ava) {
        if (ava !== "") {
            return (ava);
        }
        return require('./imgs/ava.jpg');
    }
    handleUsername(comet_uid) {

        var user = (this.props.users.find((value) => {
            return value.comet_uid === comet_uid;
        }))
        if (user !== undefined) {
            return user.username;
        }
        return comet_uid
    }
    componentDidMount() {
        //this.getGroupMessage()
        if (this.state.isAuthenticated) {
            this.getUser();
        }

        this.messageListener();
        //chat.joinGroup(this.props.user.key)
    }
    componentDidUpdate() {
        this.authenticateFunction();


    }
    render() {
        if (!this.state.isAuthenticated) {
            return <div></div>;
        }
        if (this.state.groupMessage !== undefined) {
            return (
                <div className="chatWindow">
                    <h5>Chat Box</h5>
                    <ul className="chat border rounded" id="chatList">
                        {/* <button onClick={this.testComponent.bind(this)}>Test</button> */}
                        {this.state.groupMessage.map(element => {
                            if (element.data.entities.sender !== undefined) {
                                return (
                                    <div key={element.id}>
                                        {this.props.user.comet_uid === element.sender ? (
                                            <li className="row p-0 m-0 pl-2 pr-2">
                                                <div className="col p-0 ">

                                                    <p className="text-right m-0 text-secondary"><small>{this.props.user.username}</small></p>
                                                    <div className="ml-auto message border rounded p-1"> {element.data.text}</div>
                                                </div>
                                                <div className="col-auto p-0 pl-1 d-flex align-items-end">
                                                    <img className="avatar rounded-circle border"
                                                        src={this.handleAvatar(this.props.user.avatar)}
                                                        alt={this.props.username} width="30px" height="30px" />
                                                </div>
                                            </li>
                                        ) : (
                                                <li className="row p-0 m-0 pl-2 pr-2">
                                                    <div className="col-auto p-0 pr-1 d-flex align-items-end">
                                                        <img className="avatar rounded-circle border" src={this.handleAvatar(element.data.entities.sender.entity.avatar)}
                                                            alt={this.props.username} width="30px" height="30px" />
                                                    </div>
                                                    <div className="col p-0 ">
                                                        <p className="text-left m-0 text-secondary"><small>{this.handleUsername(element.sender)}</small></p>
                                                        <div className="mr-auto message border rounded p-1 pl-2 pr-2"> {element.data.text}</div>
                                                    </div>
                                                    
                                                    {/* <div className="msg">
                                                        <div className="avatar">
                                                            <img src={this.handleAvatar(element.data.entities.sender.entity.avatar)}
                                                                alt={this.props.username} />
                                                            <p>{this.handleUsername(element.sender)}</p>
                                                        </div>
                                                        <div className="message"> {element.data.text} </div>
                                                    </div> */}
                                                </li>
                                            )}
                                    </div>
                                )
                            }
                            return null
                        })}
                    </ul>
                    <div className="chatInputWrapper row w-100 m-0">
                        <form className="col-10 p-0" onSubmit={this.sendMessageButton.bind(this)}>
                            <input
                                className="textarea input h-100 bg-white border rounded"
                                type="text"
                                placeholder="Enter your message..."
                                value={this.state.messageText}
                                onChange={this.handleChange.bind(this)}
                            />
                        </form>
                        <div className="col-auto p-0 ml-auto"><div className="btn btn-primary" onClick={this.sendMessageButton.bind(this)}>Send</div></div>

                    </div>
                </div>
            );
        }
        return;

    }
}
export default Groupchat;