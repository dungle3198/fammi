import React, { Component } from 'react'
import $ from 'jquery';
import 'bootstrap';
import { user_list } from './Data/user';
import { docClient } from "./Data/todolist";
// import { create_todolist_family } from './Data/family';
import { v4 as uuidv4 } from 'uuid'; // For version 4
import Checklist from './Checklist';
//import { CodePipeline } from 'aws-sdk';


export default class Todolist extends Component {
    constructor(props) {
        super(props)

        this.state = {
            todolist_list: [],
            current_todolist: {}, // đây là cái em nên truyền cái fetch data cá nhân mỗi 1 cái todolist
            title: "",
            elements: [],
            selected_todolist: {},
            selected_id: "",
            checklist: {}
        }

    }
    clearForm() {
        this.setState({
            title: "",
            elements: [],
            id: "",
            selected_todolist: {},
            selected_id: ""
        })
    }
    checkForm() {
        if (this.state.title === "") {
            alert("Title to be filled")
            return false
        }
        if (this.state.elements.length === 0) {
            alert("List need to have element")
            return false
        }
        else {
            for (var i = 0; i < this.state.elements.length; i++) {
                if (this.state.elements[i].name.length === 0) {
                    alert("Element's name to be filled")
                    return false
                }
            }
        }
        return true
    }
    handleCreateForm() {
        this.clearForm()
        $('#createList').modal('show')
    }
    handleAddForm() {
        let element = {
            _id: uuidv4(),
            name: "",
            list_status: false
        }
        let list = this.state.elements;
        list.push(element)
        this.setState({ elements: list })
    }
    handleRemoveForm(e) {
        var removed_elements = this.state.elements
        removed_elements.splice(e.target.id, 1)
        this.setState({ elements: removed_elements })
    }
    getTodolist() {
        var params = {
            TableName: "todolist"
        };
        docClient.scan(params, onScan.bind(this));
        function onScan(err, data) {
            if (err) {
                console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
            } else {


                var _list = JSON.parse(JSON.stringify(data.Items))
                _list.sort((a, b) => {
                    return b.time - a.time;
                })
                var mem = this.state.checklist;
                this.setState({ todolist_list: _list , selected_todolist:mem,checklist:{}});
                this.state.todolist_list.forEach(e => {
                    console.log(e);
                })
                //docClient.scan(params, onScan.bind(this));
            }
        };

    }
    handleCreate() {
        if (this.checkForm() === true) {
            var input = {
                "todolist_id": uuidv4(),
                "title": this.state.title,
                "elements": this.state.elements,
                "family_key": this.props.user.key,
                "user": this.props.user,
                "list_status": "Created",
                "time": Date.now()
            };
            var params = {
                TableName: "todolist",
                Item: input
            };
            console.log(input);
            docClient.put(params, async function (err, data) {

                if (err) {
                    console.log("users::save::error - " + JSON.stringify(err, null, 2));
                } else {
                    console.log("users::save::success" + JSON.stringify(data, null, 2));
                    this.setState({ title: "", elements: [] });

                    // console.log("users::save::success");
                }
                this.getTodolist();
            }.bind(this))
            $('#createList').modal('hide')
        }
    }

    handleDelete() {
        var confirm_box = window.confirm("Do you want to delete the todolist.");
        if (confirm_box === true) {
            var params = {
                TableName: "todolist",
                Key: {
                    "todolist_id": this.state.selected_id,
                }
            };
            docClient.delete(params, function (err, data) {
                if (err) {
                    //console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    //console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
                    this.getTodolistbyid(this.state.selected_id);
                }
            });
            //deleteTodolist(this.state.selected_id)
            $('#editList').modal('hide')
            //this.updateTodolistMul()
        }
    }
    handleChange(e) {
        let obj = {};
        obj[e.target.name] = e.target.value;
        console.log(this.state.todolist_list);
        console.log(this.state.current_todolist);
        this.setState(obj);
    }
    handleChangeArray(e) {
        var new_elements = []
        for (var i = 0; i < this.state.elements.length; i++) {
            if (i === parseInt(e.target.name)) {
                let element = {}
                element["name"] = e.target.value
                element["list_status"] = this.state.elements[i].list_status
                new_elements.push(element)
            }
            else {
                new_elements.push(this.state.elements[i])
            }
        }
        this.setState({ elements: new_elements })
    }
    async handleCheckArray(e) {
        var id = e.target.parentElement.parentElement.parentElement.id
        var index = e.target.id

        this.getElementbyidMul(id)

        var elements = this.state.current_todolist
        if (elements[index] !== undefined) {
        }
        if (elements[index] !== undefined && elements[index].list_status.toString() === e.target.name) {
            if (elements[index].list_status) {
                elements[index].list_status = false
            }
            else {
                elements[index].list_status = true
            }
            //updateToDoList_Elements(id, elements)
            //this.updateTodolistMul()
        }
        else {
            console.log("There are some problem. Try again.")
        }

    }
    getElementbyid(id) {
        var params = {
            TableName: "todolist",
            Key: {
                "todolist_id": id
            }
        };
        docClient.get(params, function (err, data) { // Đây là khúc nó bắt đầu fetch data 
            if (err) {
                console.log("users::fetchOneByKey::error - " + JSON.stringify(err, null, 2)); // => This is when the fetching failed
            }
            else { // Nếu data lấy về thành công thì nó sẽ trở thành cái object mà e muốn
                var todolist = data.Item.elements;
                this.setState({ current_todolist: todolist });
                // console.log(todolist);
                // console.log("users::fetchOneByKey::success - " + JSON.stringify(data, null, 2)); ==> This is when the fetching success
            }
        }.bind(this))
    }
    getTodolistbyid(id) {
        var params = {
            TableName: "todolist",
            Key: {
                "todolist_id": id
            }
        };
        docClient.get(params, function (err, data) { // Đây là khúc nó bắt đầu fetch data 
            if (err) {
                console.log("users::fetchOneByKey::error - " + JSON.stringify(err, null, 2)); // => This is when the fetching failed
            }
            else { // Nếu data lấy về thành công thì nó sẽ trở thành cái object mà e muốn
                var todolist = data.Item;
                this.setState({
                    title: todolist.title,
                    elements: todolist.elements
                });
                // console.log(todolist);
                // console.log("users::fetchOneByKey::success - " + JSON.stringify(data, null, 2)); ==> This is when the fetching success
            }
        }.bind(this))
    }

    show_Edit_Elements() // Function là để check element vs todolist có bị undefine rồi mới hiển thị
    {
        if (this.state.checklist.elements !== undefined) {
            return (<>
                {
                    this.state.checklist.elements.map((element, index) => {
                        return <div className="row w-100 mx-auto" key={index}>
                            <input type="text" className="col-11 form-control mb-2"
                                id={index}
                                name={element.name}
                                key={index}
                                placeholder={element.name}
                                value={element.name}
                                onChange={this.handleChangeArrayName.bind(this)} />

                            <span id={index}
                                name={element.name}
                                value={element.name}
                                onClick={this.removeElement_Edit.bind(this)}
                                className="CloseBtn close closeEdit col-auto pl-3 pr-1">×</span>

                        </div>
                    })
                }
            </>)
        }
    }
    //#region editfunctionality
    select_checklist(checklist) { 
        var new_mem = Object.assign({},checklist);
        this.setState({ checklist:JSON.parse(JSON.stringify(new_mem)) , selected_todolist: checklist})
    }
    handleChangeArrayName(e) {
        var new_list = this.state.checklist.elements;
        new_list.forEach((element,index) => {
            if (index.toString() === e.target.id) {
                
                element.name = e.target.value;
                return;
            }
        });
        var new_mem = this.state.checklist;
        new_mem.elements = new_list;
        this.setState({ checklist: new_mem })
    }
    handleChangeArrayTitle(e) {
        var new_title = this.state.checklist.title;
        var new_mem = this.state.checklist;
        if (e.target.name === new_title) {
            new_title = e.target.value;
        }
        new_mem.title = new_title;
        this.setState({ checklist: new_mem })
    }
    updateButton() {
        var params = {
            TableName: "todolist",
            Key: {
                "todolist_id": this.state.checklist.todolist_id,

            },
            UpdateExpression: "set elements = :elements, title = :title, list_status = :list_status",
            ExpressionAttributeValues: {
                ":elements": this.state.checklist.elements,
                ":title": this.state.checklist.title,
                ":list_status": "Edited"
            },
            ReturnValues: "UPDATED_NEW"
        };
        docClient.update(params, function (err, data) {

            if (err) {
                console.log("users::save::error - Elements" + JSON.stringify(err, null, 2));
            } else {
                // var u = JSON.parse(JSON.stringify(data, null, 2))
                
                this.getTodolist();
                $('#editList').modal('hide')
                //console.log(u.title)
            }
        }.bind(this));
    }
    handleEditForm() {
        let element = {}
        element["name"] = ""
        element["list_status"] = false
        var new_elements = this.state.checklist.elements;
        new_elements.push(element)
        var newmem = this.state.checklist;
        newmem.elements = new_elements;
        this.setState({ checklist: newmem })
    }
    removeElement_Edit(e) {
        var new_elements = this.state.checklist.elements;
        new_elements.splice(e.target.id, 1);
        var new_mem = this.state.checklist;
        new_mem.elements = new_elements;
        this.setState({ checklist: new_mem });
    }
    handleEdit() {
        // console.log("Id" + this.state.id)
        // updateToDoList_Title(this.state.selected_id, this.state.title)
        // updateToDoList_Elements(this.state.selected_id, this.state.elements)
        // updateToDoList_Time(this.state.selected_id)
        // updateToDoList_list_status(this.state.selected_id)
        // this.updateTodolistMul()
        $('#editList').modal('hide')
        //this.getTodolistbyidMul(this.state.selected_id)
    }
    showSelectedList() {
        $("#editList").on("hide.bs.modal", function () {
            
        }.bind(this));
        if (this.state.checklist.elements !== undefined) {
            return <div className="modal fade" id="editList" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-body">
                            <input type="text" className="form-control" name={this.state.checklist.title}
                                placeholder={this.state.checklist.title}
                                value={this.state.checklist.title}
                                onChange={this.handleChangeArrayTitle.bind(this)} />
                            <hr />
                            <div className="Element">
                                {this.show_Edit_Elements()}
                            </div>
                            <li className="list-group-item text-center lead p-0" onClick={this.handleEditForm.bind(this)}>+</li>
                            <p className="text-right m-0">
                                <button type="button" className="btn btn-primary mt-2" onClick={this.updateButton.bind(this)}>Edit</button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        }
        return
    }
    //#endregion
    showElementsCreate() // Function là để check element vs todolist có bị undefine rồi mới hiển thị
    {
        if (this.state.elements !== undefined) {
            return (<>
                {
                    this.state.elements.map((value, index) => {
                        var placeholder = index + 1
                        return <div className="row w-100 mx-auto" key={index}>
                            <input type="text" className="col form-control mb-2 mr-2"
                                key={index}
                                name={index}
                                placeholder={"Element" + placeholder}
                                onChange={this.handleChangeArray.bind(this)} />
                            <button type="button" className="CloseBtn closeCreate col-auto close" id={index} onClick={this.handleRemoveForm.bind(this)}>
                                <span id={index} className="pr-1">×</span>
                            </button>
                        </div>
                    })
                }
            </>)
        }
    }

    updateTodolist() {
        // data()
        // var new_list = []
        // todolist_list.forEach(element => {
        //     if (element.family_key === this.props.user.key) {
        //         new_list.push(element)
        //     }
        // })
        // new_list.sort((a, b) =>
        //     b.time - a.time
        // )
        // this.setState({ todolist_list: new_list })
    }

    componentDidMount() {
        this.getTodolist();
    }
    getAvatar(user_email) {
        var _u = user_list.find((e) => { return e.email === user_email });
        if (_u !== undefined) {
            if(_u.avatar!=="")
            {
                return _u.avatar;
            }
        }
        return require('./imgs/ava.jpg')
    }
    getName(user_email) {
        var _u = user_list.find((e) => { return e.email === user_email });
        if (_u !== undefined) {
            return _u.username
        }
        return "Username"

    }
    showToDoList() {
        return (<>
            {this.state.todolist_list.map((list, index) => {
                if (list.family_key === this.props.user.key) {
                    return <Checklist key={index}
                        index={index}
                        all_list={this.state.todolist_list}
                        checklist={list}
                        selectChecklist={this.select_checklist.bind(this)}
                        getList={this.getTodolist.bind(this)} />
                }
                return null
            })}
        </>)
    }
    render() {
        return (
            <div className="Todolist">
                <div className="Create m-2 mt-4 bg-white p-4 border rounded">
                    <input type="text" className="form-control" placeholder="List Title" name="title" value={this.state.title} onChange={this.handleChange.bind(this)} />
                    <hr className="mt-2 mb-2" />
                    <div className="Element">
                        {this.showElementsCreate()}
                    </div>
                    <li className="list-group-item text-center lead p-0" onClick={this.handleAddForm.bind(this)}>+</li>
                    <p className="text-right m-0">
                        <button type="button" className="btn btn-primary mt-2" onClick={this.handleCreate.bind(this)}>Create</button>
                    </p>
                </div>
                <div className="Display_List">
                    {/* Todolist */}
                    {this.showToDoList()}
                </div>
                <div className="modal fade" id="createList" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-body">
                                {/* <input type="text" className="form-control" placeholder="List Title" name="title" value={this.state.title} onChange={this.handleChange.bind(this)} />
                                <hr />
                                <div className="Element">
                                    {this.showElements()}
                                </div>
                                <li className="list-group-item text-center lead p-0" onClick={this.handleAddForm.bind(this)}>+</li>
                                <p className="text-right m-0">
                                    <button type="button" className="btn btn-primary mt-2" onClick={this.handleCreate.bind(this)}>Create</button>
                                </p> */}

                            </div>
                        </div>
                    </div>
                </div>
                {this.showSelectedList()}
            </div>
        )
    }
}