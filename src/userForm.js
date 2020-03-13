import React from 'react';
import { Redirect } from 'react-router-dom';

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

    handleCheckedChange(event) {
        const name = event.target.name
        var userForm = this.state.userForm;
        userForm[name] = event.target.checked;
        this.setState({userForm: userForm});
    }

    handleSubmit() {
        this.props.handleFormSubmit(this.state.userForm);
        this.setState({ isSubmitted: true });
    }

    render() {
        var {userForm} = this.state;
        return (
            <form onSubmit={this.handleSubmit}>
                <p>UWaterloo Fitness Assistant</p>
                <p>Input the following: </p>

                <label>Start Date:</label>
                <input name="startDate" type="date" value={userForm.startDate} onChange={this.handleChange} />
                <br /><br />

                <label>End Date:</label>
                <input name="endDate" type="date" value={userForm.endDate} onChange={this.handleChange} />
                <br /><br />

                <label>Average hrs/wk:</label>
                <input name="avgHrsPerWk" type="number" value={userForm.avgHrsPerWk} onChange={this.handleChange} />
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
                <label>
                    <input
                        name="swimming"
                        type="checkbox"
                        checked={userForm.swimming}
                        onChange={this.handleCheckedChange} />
                    Swimming
                </label> <br />
                <label>
                    <input
                        name="cifGym"
                        type="checkbox"
                        checked={userForm.cifGym}
                        onChange={this.handleCheckedChange} />
                    CIF Gym
                </label> <br />
                <label>
                    <input
                        name="pacGym"
                        type="checkbox"
                        checked={userForm.pacGym}
                        onChange={this.handleCheckedChange} />
                    PAC Gym
                </label> <br />
                <label>
                    <input
                        name="badminton"
                        type="checkbox"
                        checked={userForm.badminton}
                        onChange={this.handleCheckedChange} />
                    Badminton
                </label> <br />
                <label>
                    <input
                        name="basketball"
                        type="checkbox"
                        checked={userForm.basketball}
                        onChange={this.handleCheckedChange} />
                    Basketball
                </label> <br />
                <label>
                    <input
                        name="skating"
                        type="checkbox"
                        checked={userForm.skating}
                        onChange={this.handleCheckedChange} />
                    Skating
                </label> <br />
                <label>
                    <input
                        name="studio"
                        type="checkbox"
                        checked={userForm.studio}
                        onChange={this.handleCheckedChange} />
                    Studio
                </label> <br />
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