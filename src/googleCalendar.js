import React from 'react';
import ApiCalendar from 'react-google-calendar-api';

export default class SignInButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bookedEvents: [],
            isSignedIn: ApiCalendar.sign,

        }
        this.signUpdate = this.signUpdate.bind(this);
        ApiCalendar.onLoad(() => {
            ApiCalendar.listenSign(this.signUpdate);
        });
    }

    // Get and pass the items to their proper array.
    // Shows Events by their start and end date --> not just upcoming.
    // This ensures that the events in bookedSportEvents are within the time period.
    getEvents() {
        if (this.state.isSignedIn) {
            try{
                window.gapi.client.calendar.events.list({
                    'calendarId': 'primary',
                    'timeMin': new Date(this.props.start).toISOString(),
                    'timeMax': new Date(this.props.end).toISOString(),
                    'orderBy': 'startTime',
                    'singleEvents': true,
                }).then(({ result }) => {
                    this.props.handleUserBusy(result.items);
                }
                )
                this.props.setSignedIn();
            }
            catch(err){
                alert("An error occurred. Please go back to Home and try again.");
            }
        }
    }

    // Updates the sign in flag variable once the user has signed in.
    signUpdate(isSignedIn) {
        this.setState({
            isSignedIn
        }, () => this.getEvents())

    }

    // Screen to prompt user to sign in to their Google Account.
    signIn() {
        return (
            <div className="section">
                <h1>Google Calendar Permission</h1>
                UWaterloo Fitness Assistant requires permission to your Google Calendar for purposes of checking your availability. <br/><br/>
                Please ensure that you have already logged out of all your Google accounts (delete cookies if needed).<br/><br/>
                When ready, click the button below to sign in and allow access to your Google calendar. <br/><br/><br/>
                <button className="signInBtn" onClick={(e) => ApiCalendar.handleAuthClick()}>
                    Sign In
              </button>
            </div>
        )
    }

    // Renders the Google Sign in page if user not signed in. 
    render() {
        return (
            <div className="section">
                {!this.state.isSignedIn && this.signIn()}
            </div>
        );
    }
}