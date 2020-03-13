import React from 'react';
import SignInButton from './googleCalendar';
import * as d3 from "d3";
import data from './WeeklyActivityTimes.csv';
import facilityClosedData from './LocationClosureDates.csv';
import _ from "lodash";
import moment from 'moment';
import {ReactModal} from 'react-modal';

class ResultScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sportAvailableTimes: [],
            facilityClosed: [],
            bookedEvents: [],
            bookedSportEvents: {},
            recommendFitness: {},
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
            showModal: false
        };
        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.handleAddModal = this.handleAddModal.bind(this);
    }

    // When the component mounts, calls the local Excel files and stores the data.
    componentDidMount() {
        // Read in and store the available sport activity events from the Excel file in an array.
        d3.csv(data).then((data) => {
            this.setState({ sportAvailableTimes: data });
        }).catch(function (err) {
            throw err;
        });
        // Read in and store the facility closure dates from the Excel file in an array.
        d3.csv(facilityClosedData).then((facilityClosedData) => {
            this.setState({ facilityClosed: facilityClosedData });
        }).catch(function (err) {
            throw err;
        })
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
        let eventArray = [];
        // Check if event name is one of the sports in the array.
        this.state.bookedEvents.forEach((event) => {
            let summary = event.summary;
            // Only shows events made using our system (with name of sport).
            this.state.sports.forEach((sport) => {
                if (summary.includes(sport)) {
                    eventArray.push(event);
                }
            });
        })
        // Only sets the state if the array is not empty.
        eventArray.length > 0 && this.setState({ bookedSportEvents: eventArray });

        // First group by sport.
        let sportGroupedArray = _.groupBy(this.state.bookedSportEvents, 'summary');

        Object.keys(sportGroupedArray).forEach((key) => {
            // Then group by location.
            sportGroupedArray[key] = _.groupBy(sportGroupedArray[key], "location");
            // Note: Do not need to read it in sorted as it comes in sorted. 
            // Transform date in place using moment.js.
            Object.keys(sportGroupedArray[key]).forEach((location) => {
                sportGroupedArray[key][location].forEach((event) => {
                    event.start = this.transformDate(event.start);
                    event.end = this.transformDate(event.end);
                })
            })
        })
        // Only sets the state if the object is not empty.
        sportGroupedArray.length > 0 && this.setState({ bookedSportEvents: sportGroupedArray });
        console.log('sportGrouped Array', sportGroupedArray);
    }

    /* NEED TO FINISH: PSEDUOCODE BELOW */
    showBookedSportEvent() {
        this.setBookedSportEvents();
        let sportGroupedArray = this.state.bookedSportEvents;

        return (
            <div>
                {/* For each sport in sportGrouped Array
                        For each location in sportGroupedArray[sport]
                            Print out the sport name using h1 tags
                            Print out the location next to the sport name using h1 tags
                            Show a ul tag (so the list appears as bullet points)
                                For each event in sportGroupedArray[sport][location]
                                    Show a clickable button. On click, it will call a method to allow the user to delete that event from their calendar.
                                    List that event start & end date using li tags 
                            Show the end of the ul tag.
                */}
            </div>
        )
    }

    // From current format --> Monday, Jan 1 5:30 - Monday, Jan 1 6:30 pm
    transformDate(date) {
        let formattedDate = moment(date.dateTime).format("dddd MMM DD h:mm a");
        return formattedDate;
    }

    /* NEED TO FINISH: PSEDUOCODE BELOW */
    getUserFitnessOptions() {
        // All the fitness options have been read in and stored in this array: sportAvailableTimes.
        // All the facility closure dates have been read in and stored in this array: facilityClosed.

        // Create a variable named sportOptionDates to keep track of the sport option and its possible dates + category. 
        // Key: option (includes sport name, location, day of the week, and time).
        // Value: categorizedDates (includes possible dates and its associated date category (0, 1, 2)).

        // For each option in sportAvailableTimes.
        // Check if the user checked off the sport (if not checked, go to next option).
        // Find the first date after the starting date that is the same day of the week as the sport using a while loop.
        // Set currDate = firstDate 
        // Create a variable named optionDates to keep track of the dates for this option. 

        // While(currDate <= endDate) (date comparison using moment.js).
        // Store a variable of booked = to track the category of the date.
        // booked = 0: the user can book this event.
        // booked = 1: the user has an event during that date and time. 
        // booked = 2: the facility is closed during that time.
        // booked = 3: activity already booked for that date (+user selected max 1 activity/day).

        // For each date in facilityClosed && booked = 0
        // If date === currDate && location === location of option.
        // Set booked to 2.

        // For each event in bookedEvents && booked = 0.
        // If date of event == currDate
        // If start time of event = the start time of the option && the end time of the event = the end time of the option.
        // Set booked to 1.

        // For each event in bookedSportEvents && this.props.limit1Activity && booked = 0.
        // If date of event == currDate
        // Set booked to 3.            

        // Store the currDate and its category in an object named tempDate.
        // key = currDate
        // values = booked
        // Append this object to the current value of optionDates.

        // Store the combination of the option and its available dates in an object named categorizedDates.
        // key = option
        // values = optionDates
        // Append this object to the current value of sportOptionDates.

        // Set the state of recommendFitness to the value of sportOptionDates.
    }

    handleOpenModal(option) {
        this.setState({ showModal: true });
        this.showFitnessPopup(option);
    }

    handleAddModal() {
        this.setState({ showModal: false });
    }

    /* NEED TO FINISH: PSEDUOCODE BELOW */
    showFitnessPopup(option) {
        return (
            <ReactModal
                isOpen={this.state.showModal}
            >
                <button onClick={this.handleAddModal}>Add Events</button>
            </ReactModal>
            /* Print out the sport name using h1 tags
                Print out the location next to the sport name using h1 tags
                Print out the day of the week using h1 tags.
                Print out the start and end times using h1 tags.
                // Show a Legend for the user. 
                    // text colour = blue: the user can book this event.
                    // text colour = red: the user has an event during that date and time. 
                    // text colour = black: the facility is closed during that time.
                    // text colour = orange: activity already booked for that date (+user selected max 1 activity/day).
                Show a ul tag (show the list with checkboxes)
                    For each date in optionDates value of the option parameter passed in
                        if booked = 0 
                            list that date with a blue checkbox that can be clicked
                        else if booked = 1
                            list that date with a red checkbox that cannot be clicked
                        else if booked = 2 
                            list that date with a black checkbox that cannot be clicked
                        else (booked = 3)
                            list that date with an orange checkbox that cannot be clicked
                Show the end of the ul tag.   
                Have a button labelled Add. 
                    On click of Add, loop through each element in list.
                        // For each li element in the list.
                            // If the checkbox is checked
                                // Call the addEvent(sportName, location, date, startTime, endTime)
            */
        )
    }

    /* NEED TO FINISH: PSEDUOCODE BELOW */
    // Use the Google Calendar API.
    addEvent(sportName, location, date, startTime, endTime) {
        // Create an event with the title: sportName, location: location, etc. 
    }

    /* NEED TO FINISH: PSEDUOCODE BELOW */
    showFitnessOptions() {
        // Initializes the state variable to a tailored list of the fitness options and its associated dates.
        this.getUserFitnessOptions();
        let recommendActivities = this.state.recommendFitness;

        // Loops through the values and displays the appropriate sport options by day of the week.
        // No need to sort as the data comes in sorted.
        return (
            <div>
                {/* For each option in recommendActivities 
                        Show button to call a method (showFitnessPopup) to open up a popup. Pass in the option as a parameter to this popup.
                        Print out the sport name using h1 tags
                        Print out the location next to the sport name using h1 tags
                        Print out the day of the week using h1 tags.
                        Print out the start and end times using h1 tags.
                */}
                {Object.keys(recommendActivities).forEach((option) => {
                    return (<button onClick={this.handleOpenModal(option)}>Show More</button>)
                })}
            </div>
        )

    }
    
    /* NEED TO FINISH: PSEDUOCODE BELOW */
    showAvgHrs() {
        // Create a variable named sumHrs to track the sum of the fitness times for the start and end range.
        let sumHrs = 0;
        let numWeeks = 1;

        // If number of weeks between start and end date is > 0, set numWeeks to the # of weeks between start & end date.

        // For each event in bookedSportEvents. 
        // Calculate the difference between the end and the start time in terms of hours using moment.js. 
        // Add the difference to sumHrs variable.  

        return (
            <div>
                Current Average Hrs/Week {sumHrs / numWeeks}
            </div>
        )
    }

    showResultScreen() {
        return (
            <div>
                {this.showAvgHrs()}
                {this.showBookedSportEvent()}
                {this.showFitnessOptions()}
            </div>
        )
    };

    // Only show the result page if the user is logged in.
    render() {
        return (
            <React.Fragment>
                <SignInButton handleUserBusy={this.handleUserBusy} setSignedIn={this.setSignedIn} />
                {this.state.signedIn && this.showResultScreen()}
            </React.Fragment>
        );
    }
}
export default ResultScreen;