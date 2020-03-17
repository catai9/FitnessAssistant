import React, { ReactNode, SyntheticEvent } from 'react';
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
    getEvents(){
        if (this.state.isSignedIn){
            ApiCalendar.listUpcomingEvents()
            .then(({ result }) => {
                this.props.handleUserBusy(result.items);
            });
            this.props.setSignedIn();
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
            <div>
                Please sign in and allow access to your Google calendar. <br></br>
                Make sure that you have already logged out of all your Google accounts (delete cookies if needed).
                <br /><br/>
                <button onClick={(e) => ApiCalendar.handleAuthClick()}>
                    Sign In
              </button>
            </div>
        )
    }

    // Renders the Google Sign in page if user not signed in. 
    render() {
        return (
            <div>
                {!this.state.isSignedIn && this.signIn() }
            </div>
        );
    }
}