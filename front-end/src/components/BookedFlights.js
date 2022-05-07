import '../css/BookedFlights.css'
import React from 'react'
import { withCookies } from 'react-cookie'
import { Container } from 'react-bootstrap'
import FlightList from './FlightList'
import axios from 'axios'
import { Constants } from '../Utils'

/*
    TODO:
    1. More info for customer booked tickets
        - purchase date
        - status
    2. More info for agent booked tickets
        - which customer
        - status
        - purchase date
*/
class BookedFlightsClass extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            user: this.props.allCookies['user'],
            type: this.props.allCookies['type'],
            flights: []
        }

        if(this.state.type.toString() === Constants.CUSTOMER.toString())
            axios.get('http://localhost:5000/customer_viewmyflights', {
                params: {
                    email: this.state.user.email
                }
            }).then((res) => {
                let response = res.data;
                this.setState({flights: response.result});
            }).catch(() => {
                console.log("error")
            });
        else if(this.state.type.toString() === Constants.AGENT.toString()) {
            axios.get('http://localhost:5000/bookingagent_viewmyflights', {
                params: {
                    booking_agent_id: this.state.user[Constants.AGENT_ID]
                }
            }).then((res) => {
                let response = res.data;
                this.setState({flights: response.result})
            })
        }
    }

    render() {
        let i = -1;
        return (
            <Container className="bookedFlightsContainer">
                <h1>Booked flights</h1>
                <hr></hr>
                {
                    this.state.flights.map((info) => {
                        i += 1
                        return (
                            <FlightList key={i} info={info} />
                        );
                    })
                }
            </Container>
        );
    }
}

function BookedFlights() {
    const BookedFlightCookies = withCookies(BookedFlightsClass);
    return <BookedFlightCookies />
}

export default BookedFlights;