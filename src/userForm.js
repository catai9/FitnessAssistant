import React from 'react';
import { Redirect } from 'react-router-dom';
import moment from 'moment';

const termStartDate = ('2020-01-06');
const termEndDate = ('2020-04-03');

class UserForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userForm: {
                startDate: '',
                endDate: '',
                swimming: false,
                cifGym: false,
                pacGym: false,
                badminton: false,
                basketball: false,
                skating: false,
                studio: false,
                fieldHouse: false,
                avgHrsPerWk: 0,
                limit1Activity: false,
            },           
            isSubmitted: false,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleCheckedChange = this.handleCheckedChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        const name = event.target.name
        var userForm = this.state.userForm;
        userForm[name] = event.target.value;
        this.setState({userForm: userForm});
    }

    isFormFilledOutProperly(){
        // Check that start Date is equal to or after the first day of the current term.
        // Check that end Date is equal to or before the last day of the current term.  
        var termStart = moment(termStartDate).format('YYYY-MM-DD');
        var userStart = moment(this.state.userForm.startDate).format('YYYY-MM-DD');
        var termEnd = moment(termEndDate).format('YYYY-MM-DD');
        var userEnd = moment(this.state.userForm.endDate).format('YYYY-MM-DD');

        return termStart <= userStart &&
            userStart <= userEnd &&
            termEnd >= userEnd;
    }

    handleCheckedChange(event) {
        const name = event.target.name
        var userForm = this.state.userForm;
        userForm[name] = event.target.checked;
        this.setState({userForm: userForm});
    }

    handleSubmit() {
        // Check if form is filled out correctly before submitting form.
        if(this.isFormFilledOutProperly()){
            this.props.handleFormSubmit(this.state.userForm);
            this.setState({ isSubmitted: true });
        } else {
            // Do not submit form and provide a message to the user.
            alert("Please make sure that your start and end date are within the term start and end dates ("+
                 termStartDate+ " to "+ termEndDate+ ") AND make sure your end date is not before your start date.");
            this.setState({ isSubmitted: false });
        }
    }

    render() {
        var {userForm} = this.state;
        return (
            <form onSubmit={this.handleSubmit}>
                <p>UWaterloo Fitness Assistant</p>
                <p>Input the following: </p>

                <label>Start Date:</label>
                <input name="startDate" type="date" value={userForm.startDate} onChange={this.handleChange} required />
                <br /><br />

                <label>End Date:</label>
                <input name="endDate" type="date" value={userForm.endDate} onChange={this.handleChange} required />
                <br /><br />

                <label>Average hrs/wk:</label>
                <input name="avgHrsPerWk" type="number" value={userForm.avgHrsPerWk} onChange={this.handleChange} required />
                <br /> <br />

                <label>
                    Limit 1 Activity Per Day
                    <input
                        name="limit1Activity"
                        type="checkbox"
                        checked={userForm.limit1Activity}
                        onChange={this.handleCheckedChange} />
                </label> <br /> <br />

                <label>Preferred Sports:</label>
                <br />
                <input type="checkbox" className="info-btn hidden" />
                <label>
                    <input
                        name="swimming"
                        type="checkbox"
                        checked={userForm.swimming}
                        onChange={this.handleCheckedChange} />
                    Swimming
                </label> <br />
                {/* Info buttons next to specific sports to give more info. */}
                <div className="tooltip">i
                    <span className="tooltiptext">The CIF gym is larger than the PAC and has more equipment.</span>
                </div> 
                <label>
                    <input
                        name="cifGym"
                        type="checkbox"
                        checked={userForm.cifGym}
                        onChange={this.handleCheckedChange} />
                    CIF Gym
                </label> <br />
                <div className="tooltip">i
                    <span className="tooltiptext">The PAC gym is located on the top floor and has less equipment than CIF.</span>
                </div> 
                <label>
                    <input
                        name="pacGym"
                        type="checkbox"
                        checked={userForm.pacGym}
                        onChange={this.handleCheckedChange} />
                    PAC Gym
                </label> <br />
                <input type="checkbox" className="info-btn hidden" />
                <label>
                    <input
                        name="badminton"
                        type="checkbox"
                        checked={userForm.badminton}
                        onChange={this.handleCheckedChange} />
                    Badminton
                </label> <br />
                <input type="checkbox" className="info-btn hidden" />
                <label>
                    <input
                        name="basketball"
                        type="checkbox"
                        checked={userForm.basketball}
                        onChange={this.handleCheckedChange} />
                    Basketball
                </label> <br />
                <input type="checkbox" className="info-btn hidden" />
                <label>
                    <input
                        name="skating"
                        type="checkbox"
                        checked={userForm.skating}
                        onChange={this.handleCheckedChange} />
                    Skating
                </label> <br />
                <div className="tooltip">i
                    <span className="tooltiptext">The Studio hosts a variety of fitness and wellness classNamees including but not limited to Cycling, Pilates, Yoga and Zumba.</span>
                </div>                
                <label>
                    <input
                        name="studio"
                        type="checkbox"
                        checked={userForm.studio}
                        onChange={this.handleCheckedChange} />
                    Studio
                </label> <br />
                <div className="tooltip">i
                    <span className="tooltiptext">The Field House can be used for drop-in recreation.</span>
                </div> 
                <label>
                    <input
                        name="fieldHouse"
                        type="checkbox"
                        checked={userForm.fieldHouse}
                        onChange={this.handleCheckedChange} />
                    Field House
                </label> <br />
                <br />
                <input type="submit" />

                {this.state.isSubmitted &&
                    <Redirect to={{ pathname: "/result" }} />}
            </form>
        );
    }
}
export default UserForm;