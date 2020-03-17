import React from 'react';
import SignInButton from './googleCalendar';
import * as d3 from "d3";
import data from './WeeklyActivityTimes.csv';
import facilityClosedData from './LocationClosureDates.csv';
import _ from "lodash";
import moment from 'moment';
import Collapsible from 'react-collapsible';

const sportMapping = {
    "Swimming": "swimming",
    "CIF Fitness": "cifGym",
    "Workout": "pacGym",
    "Badminton": "badminton",
    "Basketball": "basketball",
    "Skate": "skating",
    "Studio": "studio",
    "Field House": "fieldHouse",
}

class ResultScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sportAvailableTimes: [],
            facilityClosed: [],
            bookedEvents: [],
            bookedSportEvents: {},
            recommendFitness: [],
            signedIn: false,
            sports: [
                "swimming",
                "cifGym",
                "pacGym",
                "badminton",
                "basketball",
                "skating",
                "studio",
                "fieldHouse",
            ],
            showModal: false,
        };
    }

    // Stores the user's booked events in this component's state variable.
    handleUserBusy = (bookedTimes) => {
        this.setState({ bookedEvents: bookedTimes },
            () => {
                this.setBookedSportEvents();
            });

    };

    // Sets the signed in value to true if successful login occurred.
    setSignedIn = () => {
        this.setState({ signedIn: true });
    };

    // Display booked sport events.
    setBookedSportEvents() {
        let sportEvents = [];
        // Check if event name is one of the sports in the array.
        this.state.bookedEvents.forEach((event) => {
            let summary = event.summary;
            // Only shows events made using our system (with name of sport).
            Object.keys(sportMapping).forEach((sport) => {
                if (summary.toLowerCase().includes(sport.toLowerCase())) {
                    event.summary = sport;
                    sportEvents.push(event);
                }
            });
        });

        // First group by sport.
        let sportGrouped = _.groupBy(sportEvents, 'summary');

        Object.keys(sportGrouped).forEach((key) => {
            // Then group by location.
            sportGrouped[key] = _.groupBy(sportGrouped[key], "location");
            // Note: Do not need to read it in sorted as it comes in sorted. 
            // Transform date in place using moment.js.
            Object.keys(sportGrouped[key]).forEach((location) => {
                sportGrouped[key][location].forEach((event) => {
                    event.start = this.transformDate(event.start);
                    event.end = this.transformDate(event.end);
                });
            });
        });
        this.setState({ bookedSportEvents: sportGrouped }, () => {
            /// Initializes the state variable to a tailored list of the fitness options and its associated dates.
            this.getUserFitnessOptions();
        });
    }

    // Deletes a given event from the Google Calendar.
    deleteEvent(event) {
        let selectedEventId = event.id;
        let errorOccurred = false;
        window.gapi.client.load('calendar', 'v3', function () {
            var request = window.gapi.client.calendar.events.delete({
                'calendarId': 'primary',
                'eventId': selectedEventId
            });
            request.execute(function (response) {
                if (response.error || response == false) {
                    errorOccurred = true;
                }
            });
        });
        if (errorOccurred) {
            alert("An error occurred. Please try again.");
        }
        else {
            // Update event list due to event change.
            let updatedBookedEvents = this.state.bookedEvents;
            const index = updatedBookedEvents.indexOf(event);
            if (index > -1) {
                updatedBookedEvents.splice(index, 1);
            }
            this.setState({ bookedEvents: updatedBookedEvents },
                () => {
                    this.setBookedSportEvents();
                });
        }
    }

    // Add an event to the Google Calendar.
    addEvent(date, sportName, location, startTime, endTime) {

        // Allow user to change the start and end times (values can be changed).
        // Prompts user for start and end time adjustment.
        // Do not check the times to be within the available time as user may want to add in travel and changing time.
        var userStart = prompt("Start Time (hh:mm): ", startTime);
        while (userStart == null || userStart == "") {
            var userStart = prompt("Start Time (hh:mm): ", startTime);
        }
        var userEnd = prompt("End Time (hh:mm): ", endTime);
        while (userEnd == null || userEnd == "") {
            var userEnd = prompt("End Time (hh:mm): ", endTime);
        }
        startTime = userStart;
        endTime = userEnd;

        let startDate = new Date(moment(date).format('MMMM D, YYYY') + " " + startTime + ":00");
        let endDate = new Date(moment(date).format('MMMM D, YYYY') + " " + endTime + ":00");

        // Before submitting, check the start and end times (if user changed values).
        // Check that endDate >= startDate.
        if (endDate >= startDate) {
            //RFC 3339 format
            const startDateTime = startDate.toISOString();
            const endDateTime = endDate.toISOString();

            // Create an event with the title: sportName, location: location, etc. 
            var event = {
                'summary': sportName,
                'location': location,
                'start': {
                    'dateTime': startDateTime
                },
                'end': {
                    'dateTime': endDateTime
                }
            };

            var request = window.gapi.client.calendar.events.insert({
                'calendarId': 'primary',
                'resource': event
            });

            // Update event list due to event change.
            let updatedBookedEvents = this.state.bookedEvents;

            request.execute((event) => {
                // Display a message to the user if there was an issue.
                if (event.htmlLink == undefined) {
                    alert("Event not added successfully. Make sure the entered times are in the right format (hh:mm)!");
                }
                // Add that event to the booked events. 
                else {
                    updatedBookedEvents.push(event);
                    this.setState({ bookedEvents: updatedBookedEvents },
                        () => {
                            this.setBookedSportEvents();
                        });
                }
            });
        }
        // Else if checks do not pass
        else {
            // Show an alert that start and end must be in the range of the available time.
            alert("Please make sure that the end time is AFTER the start time");
        }
    }

    // Show all the booked sport events by groupings of sport & location (then alphabetically by date).
    showBookedSportEvent() {
        let sportGrouped = this.state.bookedSportEvents;
        var rows = [];

        if (Object.keys(sportGrouped).length <= 0)
            rows.push(<p>No Booked Sport Events Found.</p>);

        // For each sport in sportGrouped Array
        Object.keys(sportGrouped).forEach((sport) => {
            // For each location in sportGroupedArray[sport]
            Object.keys(sportGrouped[sport]).forEach((location) => {
                rows.push(<h4>{sport} at {location}</h4>);

                sportGrouped[sport][location].forEach((event) => {
                    // Show a ul tag (so the list appears as bullet points)
                    //         For each event in sportGroupedArray[sport][location]
                    //         Show a clickable button. On click, it will call a method to allow the user to delete that event from their calendar.
                    //         List that event start & end date using li tags 
                    // Show the end of the ul tag.
                    rows.push(<ul className="bookedList"><li>
                        <button onClick={() => { this.deleteEvent(event) }}>🗑️ </button>
                         {event.start} to {event.end}</li>
                    </ul>)
                });
            });
        })

        return (
            <span>
                {rows}
            </span>
        )
    }

    // From current format --> Monday, Jan 1 5:30 - Monday, Jan 1 6:30 pm
    transformDate(date) {
        let formattedDate = moment(date.dateTime).format("dddd, MMMM DD h:mm a");
        return formattedDate;
    }

    // Read in and store the available sport activity events from the Excel file in an array.
    componentDidMount() {
        // All the fitness options have been read in and stored in this array: sportAvailableTimes.
        // All the facility closure dates have been read in and stored in this array: facilityClosed.
        d3.csv(data).then((data) => {
            this.setState({ sportAvailableTimes: data }, () => {
                // Read in and store the facility closure dates from the Excel file in an array.
                d3.csv(facilityClosedData).then((facilityClosedData) => {
                    this.setState({ facilityClosed: facilityClosedData });
                }).catch(function (err) {
                    throw err;
                })
            });

        }).catch(function (err) {
            throw err;
        });
    }

    // Assigns categories of available dates. 
    getUserFitnessOptions() {
        // Create a variable named sportOptionDates to keep track of the sport option and its possible dates + category. 
        // Key: option (includes sport name, location, day of the week, and time).
        // Value: categorizedDates (includes possible dates and its associated date category (0, 1, 2)).
        // let sportOptionDates = {};
        let sportOptionDates = [];

        // For each option in sportAvailableTimes.
        this.state.sportAvailableTimes.forEach((entry) => {
            // Check if the user checked off the sport (if not checked, go to next option).
            if (entry != null) {
                let sport = entry["Sport"];
                if (this.props.formData[sportMapping[sport]]) {
                    // Create a variable named optionDates to keep track of the dates for this option. 
                    let optionDates = [];

                    let dayOfWeek = entry["Day"];
                    let currDate = moment(this.props.formData.startDate);

                    // Find the first date after the starting date that is the same day of the week as the sport using a while loop.
                    // Set currDate = firstDate 
                    while (currDate.format('dddd') != dayOfWeek) {
                        currDate = moment(currDate).add(1, 'days');
                    }

                    // While(currDate <= endDate) (date comparison using moment.js).
                    while (currDate <= moment(this.props.formData.endDate)) {
                        // Store a variable of booked = to track the category of the date.
                        // booked = 0: the user can book this event.
                        // booked = 1: the user has an event during that date and time. 
                        // booked = 2: the facility is closed during that time.
                        // booked = 3: activity already booked for that date (+user selected max 1 activity/day).
                        let booked = 0;

                        // For each date in facilityClosed && booked = 0
                        this.state.facilityClosed.forEach((closeDate) => {
                            if (booked == 0) {
                                let formattedCurr = moment(currDate).format("YYYY MM DD");
                                let formattedClosed = moment(closeDate["Closed Date"], "DD-MM-YYYY").format("YYYY MM DD");

                                // If closed date === currDate && location === location of option.
                                if (formattedCurr === formattedClosed && closeDate["Location"] === entry["Location"]) {

                                    // Checks the closed date times.
                                    let closedStartHour = closeDate("Time From").split(":")[0];
                                    let sportStartHour = entry["Open Time"].split(":")[0];
                                    let closedStartMin = closeDate("Time From").split(":")[1] || 0;
                                    let sportStartMin = entry["Open Time"].split(":")[1] || 0;
                                    let closedEndHour = closeDate("Time To").split(":")[0];
                                    let sportEndHour = entry["Close Time"].split(":")[0];
                                    let closedEndMin = closeDate("Time To").split(":")[1] || 0;
                                    let sportEndMin = entry["Close Time"].split(":")[1] || 0;

                                    // If start time of closure <= the start time of the option 
                                    //  AND the end time of the closure >= the end time of the option.
                                    if (
                                        ((closedStartHour == sportStartHour && closedStartMin <= sportStartMin) ||
                                            (closedStartHour < sportStartHour))

                                        && ((closedEndHour == sportEndHour && closedEndMin >= sportEndMin)
                                            || (closedEndHour > sportEndHour))
                                    ) {
                                        // Set booked to 2.
                                        booked = 2;
                                    }
                                }
                            }
                        })

                        // For each event in bookedEvents && booked = 0.
                        this.state.bookedEvents.forEach((event) => {
                            if (booked == 0) {
                                let startFormatted = moment(event.start).format("MM DD");
                                let currFormatted = moment(currDate).format("MM DD");
                                // If date of event == currDate
                                if (startFormatted == currFormatted) {
                                    let bookedStartHour = moment(event.start).get('hour');
                                    let sportStartHour = entry["Open Time"].split(":")[0];
                                    let bookedStartMin = moment(event.start).get('minute');
                                    let sportStartMin = entry["Open Time"].split(":")[1] || 0;
                                    let bookedEndHour = moment(event.end).get('hour');
                                    let sportEndHour = entry["Close Time"].split(":")[0];
                                    let bookedEndMin = moment(event.end).get('minute');
                                    let sportEndMin = entry["Close Time"].split(":")[1] || 0;

                                    // If start time of event <= the start time of the option 
                                    //  AND the end time of the event >= the end time of the option.
                                    if (
                                        ((bookedStartHour == sportStartHour && bookedStartMin <= sportStartMin) ||
                                            (bookedStartHour < sportStartHour))

                                        && ((bookedEndHour == sportEndHour && bookedEndMin >= sportEndMin)
                                            || (bookedEndHour > sportEndHour))
                                    ) {
                                        // Set booked to 1.
                                        booked = 1;
                                    }
                                }
                            }
                        })

                        // If this.props.limit1Activity.
                        if (this.props.formData.limit1Activity) {
                            // For each event in bookedSportEvents.
                            Object.keys(this.state.bookedSportEvents).forEach((sport) => {
                                Object.keys(this.state.bookedSportEvents[sport]).forEach((location) => {
                                    this.state.bookedSportEvents[sport][location].forEach((sportEvent) => {
                                        // If booked = 0.
                                        if (booked == 0) {
                                            let startFormatted = moment(sportEvent.start).format("MM DD");
                                            let currFormatted = moment(currDate).format("MM DD");
                                            // If date of event == currDate
                                            if (startFormatted == currFormatted) {
                                                // Set booked to 3. 
                                                booked = 3;
                                            }
                                        }
                                    })
                                })
                            })
                        }

                        // Store the currDate and its category in an object named tempDate.
                        // key = currDate
                        // values = booked
                        let tempDate = {
                            date: currDate,
                            category: booked
                        }

                        // Append this object to the current value of optionDates.
                        optionDates.push(tempDate);

                        // Increment current day by 7 days to go to next week.
                        currDate = moment(currDate).add(7, 'days');
                    }
                    // Store the combination of the option and its available dates in an object named categorizedDates.
                    // key = entry
                    // values = optionDates
                    let categorizedDates = {
                        key: entry,
                        dates: optionDates
                    }

                    // Append this object to the current value of sportOptionDates.
                    sportOptionDates.push(categorizedDates);
                }
            }
        })
        // Set the state of recommendFitness to the value of sportOptionDates.
        // this.setState(Object.assign(this.state.recommendFitness,sportOptionDates));
        this.setState({ recommendFitness: sportOptionDates })
    }

    // Shows the possible fitness options and their associated date categories.
    // Only show options if there is at least one available date that the user can add to calendar.
    showFitnessOptions() {
        if (this.props.formData.swimming ||
            this.props.formData.cifGym ||
            this.props.formData.pacGym ||
            this.props.formData.badminton ||
            this.props.formData.basketball ||
            this.props.formData.skating ||
            this.props.formData.studio ||
            this.props.formData.fieldHouse
        ) {
            let recommendActivities = this.state.recommendFitness;

            var rows = [];
            // Color code dates according to the legend.
            let classMap = ["blue", "red", "black", "orange"];

            // Loops through the values and displays the appropriate sport options by day of the week.
            // No need to sort as the data comes in sorted.

            // For each option in recommendActivities 
            recommendActivities.forEach((option) => {
                let available = false;
                // If they have at least 1 date with a booked value of 0 (i.e. one date that can be booked.)
                if (option["dates"] != undefined && option["dates"].length > 0) {
                    option["dates"].forEach((date) => {
                        if (date["category"] == 0) {
                            available = true;
                        }
                    })
                }
                // Only show if at least one date is available.
                if (available) {
                    let description = option["key"]["Sport"] + " at " + option["key"]["Location"] + " on " + option["key"]["Day"] + " from " + this.tConv24(option["key"]["Open Time"]) + " - " + this.tConv24(option["key"]["Close Time"]);

                    let dates = [];

                    option["dates"].forEach((date) => {
                        let dateVal = moment(date["date"]).format('MMMM DD, YYYY');
                        let category = date["category"];

                        // Disable the checkbox if the date cannot be selected.
                        if (category != 0) {
                            dates.push(
                                <span>
                                    <p className={classMap[date["category"]] + " noAdd"}>{dateVal}</p>
                                </span>
                            );
                        }
                        else {
                            dates.push(
                                <span>
                                    <p className={classMap[date["category"]] + " canAdd"}>
                                        <button onClick={() => { this.addEvent(date["date"], option["key"]["Sport"], option["key"]["Location"], option["key"]["Open Time"], option["key"]["Close Time"]) }}>
                                        📅
                                        </button>
                                        {dateVal}
                                    </p>
                                </span>
                            );
                        }
                    })
                    rows.push(<p>
                        <Collapsible trigger={"+ " + description}>
                            {dates}
                        </Collapsible>
                    </p>
                    );
                }
            })

            return (
                <span>
                    <h3>Legend:</h3>
                        <p class="blue">Blue: Available Event</p>
                        <p class="red">Red: Conflicting Event (there is already an event with that day and time)</p>
                        <p class="black">Black: Facility Closure</p>
                        <p class="orange">Orange: Max 1 Activity/Day Desired and Already One Activity That Day</p>
                    <h3>Possible Options: </h3>
                    {rows.length > 0 ? rows : <p>All available times conflict with your current schedule, facility closures, and/or you already have an event during that day (and checked off max 1 activity/day).</p>}
                </span>
            )
        }

        // If no boxes checked on userform then just show a general message.
        else {
            return <p>No Fitness Options Available. <br /> Please make sure you check off at least one sport.</p>
        }
    }

    // Convert the army time to a more readable time (14:00 --> 2:00 PM).
    // This method was copied from: https://stackoverflow.com/questions/13898423/javascript-convert-24-hour-time-of-day-string-to-12-hour-time-with-am-pm-and-no
    // This method was also revised to show : between the times.
    tConv24(time24) {
        var ts = time24;
        var H = ts.split(time24, ":")[0];
        var h = (H % 12) || 12;
        h = (h < 10)?("0"+h):h;  // leading 0 at the left for 1 digit hours
        var ampm = H < 12 ? " AM" : " PM";
        var min = ts.split(time24, ":")[1];
        ts = h + ":" + min + ampm;
        return ts;
      };

    // Calculates and shows the average number of hours of fitness activities in the user inputted date range. 
    showAvgHrs() {
        // Create a variable named sumHrs to track the sum of the fitness times for the start and end range.
        let sumHrs = 0;
        let numWeeks = 1;

        // Calculate the difference between the two dates in number of weeks.
        var start = new Date(this.props.formData.startDate);
        var end = new Date(this.props.formData.endDate);
        var diff = (end.getTime() - start.getTime()) / 1000;
        diff /= (60 * 60 * 24 * 7);
        var weeks = Math.abs(diff);

        // If number of weeks between start and end date is > 0, set numWeeks to the # of weeks between start & end date.
        if (weeks > 0) {
            numWeeks = weeks;
        }

        // For each event in bookedSportEvents. 
        // Calculate the difference between the end and the start time in terms of hours using moment.js. 
        // Add the difference to sumHrs variable.  
        Object.keys(this.state.bookedSportEvents).forEach((sport) => {
            Object.keys(this.state.bookedSportEvents[sport]).forEach((location) => {
                this.state.bookedSportEvents[sport][location].forEach((event) => {
                    var hours = Math.abs(new Date(event.end) - new Date(event.start)) / 36e5;
                    sumHrs = sumHrs + hours;
                })
            })
        })

        return (
            <span>
                <h3>Desired Average Hrs/Week: {this.props.formData.avgHrsPerWk}</h3>
                <h3>Current Average Hrs/Week: {Math.round((sumHrs / numWeeks) * 10) / 10}</h3>
                <ul>
                    <li>Total Hours: {sumHrs}</li>
                    <li>Number of Weeks: {Math.round(numWeeks * 10) / 10}</li>
                </ul>
            </span>
        )
    }

    // General overview of the result screen.
    showResultScreen() {
        return (
            <div className="section">
                <h1>UWaterloo Fitness Assistant</h1>
                <h2 className="sectionHead">Average Hrs/Week</h2>
                {this.showAvgHrs()}
                <br />
                <h2 className="sectionHead">Booked Sport Events</h2>
                <h3>Note: This will only shows events that have a summary that includes one of the sports supported by this system.</h3>
                {this.showBookedSportEvent()}
                <br />
                <h2 className="sectionHead">Possible Fitness Options</h2>
                {this.showFitnessOptions()}
            </div>
        )
    };

    // Only show the result page if the user is logged in.
    render() {
        return (
            <React.Fragment>
                <SignInButton handleUserBusy={this.handleUserBusy} setSignedIn={this.setSignedIn} start={this.props.formData.startDate} end={this.props.formData.endDate} />
                {this.state.signedIn && this.showResultScreen()}
            </React.Fragment>
        );
    }
}
export default ResultScreen;