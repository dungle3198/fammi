import React, { Component } from 'react'
import { docClient } from './Data/todolist'
export default class Checklist extends Component {
    constructor(props) {
        super(props)

        this.state = {
            list: this.props.all_list[this.props.index],
            refresh: false
        }
    }
    handleChangeArray(e) {
        var new_list = this.state.list.elements;
        this.state.list.elements.forEach(element => {
            if (element.name === e.target.name) {
                console.log(element);
                element.status = e.target.checked;

                return;
            }
        });
        var new_mem = this.state.list;
        new_mem.elements = new_list;


        var params = {
            TableName: "todolist",
            Key: {
                "todolist_id": this.state.list.todolist_id,

            },
            UpdateExpression: "set elements = :elements",
            ExpressionAttributeValues: {
                ":elements": new_list,
            },
            ReturnValues: "UPDATED_NEW"
        };
        docClient.update(params, function (err, data) {

            if (err) {
                //console.log("users::save::error - Elements" + JSON.stringify(err, null, 2));
            } else {
                this.setState({ list: new_mem });
            }
        }.bind(this));

        // for (var i = 0; i < this.state.list.length; i++) {
        //     if (i === parseInt(e.target.name)) {
        //         let element = {}
        //         element["name"] = e.target.value
        //         element["status"] = this.state.list[i].status
        //         new_elements.push(element)
        //     }
        //     else {
        //         new_elements.push(this.state.list[i])
        //     }
        // }


    }
    handleChangeArrayName(e) {
        var new_list = this.state.list.elements;
        this.state.list.elements.forEach(element => {
            if (element.name === e.target.name) {
                console.log(element);
                element.name = e.target.value;
                return;
            }
        });
        var new_mem = this.state.list;
        new_mem.elements = new_list;
        this.setState({ list: new_mem })
    }
    handleChangeArrayTitle(e) {
        var new_title = this.state.list.title;
        var new_mem = this.state.list;
        if (e.target.name === new_title) {
            new_title = e.target.value;
        }
        new_mem.title = new_title;
        this.setState({ list: new_mem })
    }
    selectList() {
        this.props.selectChecklist(this.state.list);
        console.log(this.props.all_list);
    }
    handleChange(e) {
        let obj = {};
        obj[e.target.name] = e.target.value;

        this.setState(obj);
    }
    deleteList() {
        var confirm_box = window.confirm("Do you want to delete the todolist.");
        if (confirm_box === true) {
            var params = {
                TableName: "todolist",
                Key: {
                    "todolist_id": this.props.checklist.todolist_id,
                }
            };
            docClient.delete(params, function (err, data) {
                if (err) {
                    console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    this.props.getList();
                    console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
                }
            }.bind(this));
        }
    }
    handleAvatar(ava) {
        if (ava !== "") {
            return (ava);
        }
        return require('./imgs/ava.jpg');
    }
    componentDidUpdate() {
        if (this.state.list !== this.props.all_list[this.props.index]) {
            this.setState({ list: this.props.all_list[this.props.index] })
        }
    }
    render() {

        return (
            <div className="checklist bg-white m-2 border rounded">
                <div className="title m-2 mt-3">
                    <div className="col d-flex">
                        <img alt={this.state.list.user.avatar}
                            className="border rounded-circle"
                            src={this.handleAvatar(this.state.list.user.avatar)}
                            width="40px" height="40px" />
                        <div className="pl-2 title lead">{this.state.list.title}</div>
                        <div className="ml-auto">
                            <span onClick={this.selectList.bind(this)} data-toggle="modal" data-target="#editList"> <small className="hover" >Edit</small> </span>
                            <span><small>|</small></span>
                            <span onClick={this.deleteList.bind(this)}> <small className="hover" >Delete</small> </span>
                        </div>
                    </div>
                    <div className="ml-3 creator">
                        <small>{this.state.list.list_status} by <strong>{this.state.list.user.username}</strong> at {new Date(this.state.list.time).toString().substr(4, 11)}</small>
                    </div>
                    {/* <div className="buttoncontainer">
                            <div className="editbutton" data-toggle="modal" data-target="#editBox" onClick={this.selectList.bind(this)} >edit</div>
                            <div className="deletebutton" data-toggle="modal" data-target="#editBox" onClick={this.deleteList.bind(this)} >delete</div>
                        </div> */}



                </div>

                <ul className="list-group ml-4 mr-4 mb-4 mt-2">
                    {this.state.list.elements.map((element, index) => {
                        return <li key={index} className="list-group-item">
                            <label>
                                <input id={index}
                                    name={element.name.toString()}
                                    type="checkbox"
                                    checked={element.status}
                                    onChange={this.handleChangeArray.bind(this)} />
                            </label> {element.name}
                        </li>
                    })}
                </ul>

            </div>
        )
    }
}
