
import React, { Component } from 'react';
import './Cockpit.css';

class Cockpit extends Component {
    getTime = () => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const actTime = new Date();

        const strTime = `${days[actTime.getDay()]}, ${actTime.getDate()}.
                         ${months[actTime.getMonth()]} ${actTime.getFullYear()} | 
                         ${actTime.getHours()}:${(actTime.getMinutes() < 10 ? '0' : '') + actTime.getMinutes()}`;
        return strTime;        
    }

    changeTime = () => {
        this.setState({
            time: this.getTime()
        })
    }

    componentDidMount() {
        setInterval(() => this.changeTime(), 1000);
    }

    state = {
        time: this.getTime()
    }

    render (){
        
        return(
            <div className="Cockpit">
                <div className="Navbar">
                    <p>{this.props.homeName}</p>
                    <p>{this.state.time}</p>
                </div>
            </div>
        )
    }
}

export default Cockpit;