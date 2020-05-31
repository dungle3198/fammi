import React, { Component } from 'react'
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from "@fullcalendar/interaction";
import $ from 'jquery';
import 'bootstrap';
import ReactTooltip from 'react-tooltip'
import { createEvent, deleteEvent, data, event_list, updateEvent_Title, updateEvent_Description, updateEvent_StartDate, updateEvent_EndDate } from "./Data/event";
import { create_event_family } from './Data/family';

export default class CalendarUser extends Component {
    constructor(props) {
        super(props)

        this.state = {
            event_list: {},
            title: "",
            description: "",
            start: "",
            end: "",
            date: "",
            id: ""
        }

    }
    eventTransform = (event_obj) => {
        event_obj.start = event_obj.start_time;
        event_obj.end = event_obj.end_time;
        return event_obj;
    }
    handleDateClick = (arg) => {
        this.clearForm()
        this.setState({ date: arg.dateStr })
        $('#createEvent').modal('show')
    }
    clearForm() {
        this.setState({
            title: "",
            description: "",
            start: "",
            end: "",
            date: "",
            id: ""
        })
    }
    checkOverlap(start_time, end_time) {
        for (var i = 0; i < this.state.event_list.length; i++) {
            if (this.state.event_list[i].start < end_time & start_time < this.state.event_list[i].end) {
                return true
            }
        }
        return false
    }

    createEventForm() {
        if (this.state.start > this.state.end) {
            alert("Start time is later than end time.")
        }
        else if (this.state.title === "" || this.state.description === "" || this.state.start === "" || this.state.end === "") {
            alert("All input need to be filled")
        }
        else {
            var start_time = this.state.date + "T" + this.state.start + ":00"
            var end_time = this.state.date + "T" + this.state.end + ":00"
            createEvent(this.state.title, this.state.description, start_time, end_time, this.props.user.key).then(() => {
                var list = this.props.family.events;
                var event_input = {
                    user: this.props.user.username,
                    event: this.state.title
                }
                list.push(event_input)
                create_event_family(this.props.family.family_key, list)
            })
            $('#createEvent').modal('hide')
            this.updateCalendarMul()
            if (this.checkOverlap(start_time, end_time)) {
                alert("Events is overlaped")
            }
        }
    }
    handleEventClick = (arg) => { // bind with an arrow function
        console.log("click")
        $('#selectEvent').modal('show')
        var start = ("0" + arg.event.start.getHours()).slice(-2) + ":" + ("0" + arg.event.start.getMinutes()).slice(-2)
        var end = ("0" + arg.event.end.getHours()).slice(-2) + ":" + ("0" + arg.event.end.getMinutes()).slice(-2)
        var month = arg.event.end.getMonth() + 1
        var date = arg.event.end.getFullYear() + "-" + ("0" + month).slice(-2) + "-" + ("0" + arg.event.end.getDate()).slice(-2)
        this.setState({
            title: arg.event.title,
            description: arg.event.extendedProps.description,
            start: start,
            end: end,
            date: date,
            id: arg.event.extendedProps.event_id
        })
        console.log(this.state)
    }
    editEventForm() {
        if (this.state.start > this.state.end) {
            alert("Start time is later than end time.")
        }
        else if (this.state.title === "" || this.state.description === "" || this.state.start === "" || this.state.end === "") {
            alert("All input need to be filled")
        }
        else {
            var start_time = this.state.date + "T" + this.state.start + ":00"
            var end_time = this.state.date + "T" + this.state.end + ":00"
            updateEvent_Title(this.state.id, this.state.title)
            updateEvent_Description(this.state.id, this.state.description)
            console.log(this.state.date)
            console.log(start_time)
            console.log(end_time)
            updateEvent_StartDate(this.state.id, start_time)
            updateEvent_EndDate(this.state.id, end_time)
            this.updateCalendarMul()
            $('#selectEvent').modal('hide')
            if (this.checkOverlap(start_time, end_time)) {
                alert("Events is overlaped")
            }
        }
    }
    deleteEventForm() {
        var confirm_box = window.confirm("Do you want to delete the event.");
        if (confirm_box === true) {
            deleteEvent(this.state.id)
            $('#selectEvent').modal('hide')
            this.updateCalendarMul()
        }
    }
    handleEventPositioned(arg) {
        arg.el.setAttribute("data-tip", arg.event.extendedProps.description);
        ReactTooltip.rebuild();
    }
    handleChange(e) {
        let obj = {};
        obj[e.target.name] = e.target.value;
        this.setState(obj);
    }
    updateCalendar() {
        data()
        var list = []
        event_list.forEach(event => {
            if (event.family_key === this.props.user.key) {
                list.push(event)
            }
        })
        // this.setState({event_list:list})
        //console.log(event_list)
        //console.log(this.state.event_list)
        $("#calendar").html("")
        var calendarEl = document.getElementById('calendar');
        var calendar = new Calendar(calendarEl, {
            defaultView: "dayGridMonth",
            events: list,
            dateClick: this.handleDateClick,
            eventClick: this.handleEventClick,
            plugins: [dayGridPlugin, interactionPlugin],
            eventPositioned: this.handleEventPositioned,
            displayEventEnd: "true"
        });
        calendar.render();

        // this.setState({event_list:list})
        //console.log(event_list)
        //console.log(this.state.event_list)
        $("#minicalendar").html("")
        calendarEl = document.getElementById('minicalendar');
        calendar = new Calendar(calendarEl, {
            defaultView: "dayGridMonth",
            events: list,
            plugins: [dayGridPlugin, interactionPlugin],
            eventPositioned: this.handleEventPositioned,
        });
        calendar.render();

        console.log("Done")
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
    componentDidMount() {
        data()
        //this.state.event_list = event_list

        this.updateCalendar()
    }
    render() {
        return (
            <div className="Calendar pl-2 pr-2 pb-2 pt-4 rounded">
                <div className="p-4 bg-white border rounded">
                    <div id="calendar"></div>
                    <ReactTooltip effect="solid" type="info" />
                </div>
                <div>
                    {/* Modal */}
                    <div className="modal fade" id="createEvent" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-body">
                                    <input type="text" className="form-control" placeholder="Event Title" name="title" value={this.state.title} onChange={this.handleChange.bind(this)} />
                                    <input type="text" className="form-control mt-2" placeholder="Event description" name="description" value={this.state.description} onChange={this.handleChange.bind(this)} />
                                    <input type="time" className="form-control mt-2" placeholder="Start Time" name="start" value={this.state.start} onChange={this.handleChange.bind(this)} />
                                    <input type="time" className="form-control mt-2" placeholder="End Time" name="end" value={this.state.end} onChange={this.handleChange.bind(this)} />
                                    <p className="text-right m-0">
                                        <button type="button" className="btn btn-primary mt-2" onClick={this.createEventForm.bind(this)}>Create</button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal fade" id="selectEvent" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-body">
                                    <input type="text" className="form-control" name="title" value={this.state.title} onChange={this.handleChange.bind(this)} />
                                    <input type="text" className="form-control mt-2" name="description" value={this.state.description} onChange={this.handleChange.bind(this)} />
                                    <input type="time" className="form-control mt-2" name="start" value={this.state.start} onChange={this.handleChange.bind(this)} />
                                    <input type="time" className="form-control mt-2" name="end" value={this.state.end} onChange={this.handleChange.bind(this)} />
                                    <p className="text-right m-0">
                                        <button type="button" className="btn btn-danger mt-2 mr-2" onClick={this.deleteEventForm.bind(this)}>Delete</button>
                                        <button type="button" className="btn btn-primary mt-2" onClick={this.editEventForm.bind(this)}>Edit</button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}