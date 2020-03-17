import React from 'react';
import SignInButton from './googleCalendar';
import * as d3 from "d3";
import data from './WeeklyActivityTimes.csv';
import facilityClosedData from './LocationClosureDates.csv';
import _ from "lodash";
import moment from 'moment';
import { ReactModal } from 'react-modal';

const sportMapping = {
    "Swim": "swimming",
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
        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.handleAddModal = this.handleAddModal.bind(this);
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
            this.state.sports.forEach((sport) => {
                if (summary.includes(sport)) {
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
        // Only sets the state if the object is not empty.
        if (Object.keys(sportGrouped).length > 0) {
            this.setState(Object.assign(this.state.bookedSportEvents, sportGrouped));
        }
    }

    /* NEED TO FINISH: DELETION OF EVENT FROM GOOGLE CALENDAR */
    // If the user clicks the garbage can next to the header, then loop through all of the tags and remove them.
    showBookedSportEvent() {

        let sportGrouped = this.state.bookedSportEvents;
        var rows = [];

        // For each sport in sportGrouped Array
        Object.keys(sportGrouped).forEach((sport) => {
            // For each location in sportGroupedArray[sport]
            Object.keys(sportGrouped[sport]).forEach((location) => {
                // Print out the sport name using h1 tags
                // Print out the location next to the sport name using h1 tags
                rows.push(<h2>{sport} {location}</h2>);

                sportGrouped[sport][location].forEach((event) => {
                    // Show a ul tag (so the list appears as bullet points)
                    //         For each event in sportGroupedArray[sport][location]
                    //         Show a clickable button. On click, it will call a method to allow the user to delete that event from their calendar.
                    //         List that event start & end date using li tags 
                    // Show the end of the ul tag.
                    rows.push(<ul><li>
                        <button>Delete</button>
                        {event.start} to {event.end}</li>
                    </ul>)
                });
            });
        })

        return (
            <div>
                {rows}
            </div>
        )
    }

    // From current format --> Monday, Jan 1 5:30 - Monday, Jan 1 6:30 pm
    transformDate(date) {
        let formattedDate = moment(date.dateTime).format("dddd MMM DD h:mm a");
        return formattedDate;
    }

    componentDidMount() {
        // Read in and store the available sport activity events from the Excel file in an array.
        // All the fitness options have been read in and stored in this array: sportAvailableTimes.
        // All the facility closure dates have been read in and stored in this array: facilityClosed.
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
                                // If date === currDate && location === location of option.
                                if (moment(closeDate["Closed Date"]) == currDate && closeDate["Location"] == entry["Location"]) {
                                    // Set booked to 2.
                                    booked = 2;
                                }
                            }
                        })

                        // For each event in bookedEvents && booked = 0.
                        this.state.bookedEvents.forEach((event) => {
                            if (booked == 0) {
                                // If date of event == currDate
                                if (moment(event.start).get('date') == currDate) {
                                    let bookedStartHour = moment(event.start).get('hour');
                                    let sportStartHour = entry["Open Time"].split(":")[0];
                                    let bookedStartMin = moment(event.start).get('minute');
                                    let sportStartMin = entry["Open Time"].split(":")[1] || 0;
                                    let bookedEndHour = moment(event.end).get('hour');
                                    let sportEndHour = entry["Close Time"].split(":")[0];
                                    let bookedEndMin = moment(event.end).get('minute');
                                    let sportEndMin = entry["Close Time"].split(":")[1] || 0;


                                    // If start time of event = the start time of the option 
                                    //  AND the end time of the event >= the end time of the option.
                                    if (bookedStartHour == sportStartHour
                                        && bookedStartMin == sportStartMin
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
                            this.state.bookedSportEvents.forEach((sportEvent) => {
                                // If booked = 0.
                                if (booked == 0) {
                                    // If date of event == currDate
                                    if (moment(sportEvent.start).get('date') == currDate) {
                                        // Set booked to 3. 
                                        booked = 3;
                                    }
                                }
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

    handleOpenModal(option) {
        this.setState({ showModal: true });
        this.showFitnessPopup(option);
    }

    handleAddModal() {
        this.handleCloseModal();
    }

    handleCloseModal() {
        this.setState({ showModal: false });
    }

    /* NEED TO FINISH: PSEDUOCODE BELOW */
    showFitnessPopup(option) {
        return (
            <ReactModal
                isOpen={this.state.showModal}
            >
                {/* LOW PRIORITY: Check that at least one event selected, else grey out button. */}
                <button onClick={this.handleAddModal}>Add Events</button>
                {/* Show button that allows user to exit without adding anything. */}
                <button onClick={this.handleCloseModal}>Close</button>
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
                                // Allow user to change the start and end times (values can be changed).
                                    // Before submitting, check the start and end (user changed values).
                                    // Check that start >= startTime && start <= endTime.
                                    // Check that end <= endTime && end >= startTime
                                        // Call the addEvent(sportName, location, date, startTime, endTime)
                                    // Else if checks do not pass
                                        // Show an alert that start and end must be in the range of the available time.
                        
            */
        )
    }

    /* NEED TO FINISH: PSEDUOCODE BELOW */
    // Use the Google Calendar API.
    addEvent(sportName, location, date, startTime, endTime) {
        // Create an event with the title: sportName, location: location, etc. 
    }

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
            /// Initializes the state variable to a tailored list of the fitness options and its associated dates.
            if (recommendActivities == null || recommendActivities.length <= 0) {
                this.getUserFitnessOptions();
            }

            var rows = [];

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
                if (available) {
                    // Show button to call a method (showFitnessPopup) to open up a popup. Pass in the option as a parameter to this popup.
                    // Print out the sport name using h1 tags
                    // Print out the location next to the sport name using h1 tags
                    // Print out the day of the week using h1 tags.
                    // Print out the start and end times using h1 tags.
                    /* NEED TO FINISH: Call showFitnessPopup when button clicked*/
                    rows.push(<ul><li><button>More</button>
                        <h2>{option["key"]["Sport"]} {option["key"]["Day"]} {option["key"]["Open Time"]} - {option["key"]["Close Time"]}</h2>
                        <h3>{option["key"]["Location"]}</h3>
                    </li></ul>);
                }
                // Else (no dates are available for that activity; ex. they all conflict)
                //     Do not show
            })

            return (
                <div>
                    {rows}
                </div>
            )
        }

        // If no boxes checked on userform then just show a general message.
        else {
            return <div>No Fitness Options Available. <br /> Please make sure you check off at least one sport.</div>
        }
    }

    showAvgHrs() {
        // Create a variable named sumHrs to track the sum of the fitness times for the start and end range.
        let sumHrs = 0;
        let numWeeks = 1;

        // Calculate the difference between the two dates in number of weeks.
        var start = new Date(this.props.formData.startDate);
        var end = new Date(this.props.formData.endDate);
        var diff =(end.getTime() - start.getTime()) / 1000;
        diff /= (60 * 60 * 24 * 7);
        var weeks = Math.abs(Math.round(diff));

        // If number of weeks between start and end date is > 0, set numWeeks to the # of weeks between start & end date.
        if(weeks > 0) {
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
            <div>
                <h1>Current Average Hrs/Week: {sumHrs / numWeeks}</h1>
            </div>
        )
    }

    // NEED TO FINISH: Make sure that the events in bookedSportEvents are within the time period.
    showResultScreen() {
        return (
            <div>
                {this.showAvgHrs()}
                <h1>Booked Sport Events</h1>
                {this.showBookedSportEvent()}
                <h1>Possible Fitness Options</h1>
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