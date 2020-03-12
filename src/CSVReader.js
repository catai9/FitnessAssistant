import React, { Component } from 'react';
import * as d3 from "d3";
import data from './WeeklyActivityTimes.csv';

class Reader extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {

        d3.csv(data).then(function (data) {
            console.log(data)
        }).catch(function (err) {
            throw err;
        })
    }

    render() {
        return (
            <div className="App" >
                <div> Data Visualization </div>
            </div>
        );
    }
}

export default Reader;