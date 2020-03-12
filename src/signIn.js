import React, { ReactNode } from 'react';
import ApiCalendar from 'react-google-calendar-api';

export default class StatusSign extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sign: ApiCalendar.sign,
        };
        this.signUpdate = this.signUpdate.bind(this);
        ApiCalendar.onLoad(() => {
            ApiCalendar.listenSign(this.signUpdate);
        });
    }

    getEvents(){
        if (this.state.sign)
        ApiCalendar.listUpcomingEvents()
            .then(({ result }) => {
                // Store the items in their proper array.
                console.log(result.items);
            });
    }

    signUpdate(sign) {
        this.setState({
            sign
        }, () => this.getEvents())
        
    }

    render() {
        return (
            <div>{this.state.sign}</div>
        );
    }
}