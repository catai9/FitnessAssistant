import React from 'react';
import DoubleButton from './googleCalendar'
import StatusSign from './signIn'
import Reader from './CSVReader'

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

    getSportAvailability() {

    }

    render() {
        return (
            <React.Fragment>
                <StatusSign />
                <DoubleButton />
                <Reader />
            </React.Fragment>
        );
    }
}
export default ResultScreen;