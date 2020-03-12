import React from 'react';
import DoubleButton from './googleCalendar'

class ResultScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    generateResults() {
        // const event = this.buildEventoGoogle(values);
        // const request = window.gapi.client.calendar.events.insert({
        //     calendarId: "primary",
        //     resource: event
        // });
    }

    getUserAvailability() {


    }
    render() {
        return (
            <DoubleButton/>
        );
    }
}
export default ResultScreen;