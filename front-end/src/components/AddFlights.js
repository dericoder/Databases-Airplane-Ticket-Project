import "../css/AddFlights.css"
import React from 'react'
import axios from 'axios'
import { withCookies } from 'react-cookie'
import { Container, Form, Button, FloatingLabel as Label } from 'react-bootstrap'
import { Airports, Constants } from "../Utils"
import { Typeahead } from 'react-bootstrap-typeahead'
import Comp from './Comp'

class AddFlightsClass extends Comp {

    constructor(props) {
        super(props);

        this.state = {
            error: false,
            errorMessage: '',
            flightNumberValidated: true,
            departureValidated: true,
            arrivalValidated: true,
            departureTimeValidated: true,
            arrivalTimeValidated: true,
            priceValidated: true,
            airplaneValidated: true
        };

        this.addFlight = this.addFlight.bind(this);
        this.validate = this.validate.bind(this);
    }

    validate() {
        let fields = {
            flightNumberValidated: true,
            departureValidated: true,
            arrivalValidated: true,
            departureTimeValidated: true,
            arrivalTimeValidated: true,
            priceValidated: true,
            airplaneValidated: true
        };

        let valid = true;

        if(this.state.flightNumber === undefined || this.state.flightNumber === "" || this.state.flightNumber < 0) {
            fields.flightNumberValidated = false;
            valid = false;
        }

        if(this.state.departure === undefined || this.state.departure === "") {
            fields.departureValidated = false;
            valid = false;
        }

        if(this.state.departureTime === undefined || this.state.departureTime === "") {
            fields.departureTimeValidated = false;
            valid = false;
        }

        if(this.state.arrival === undefined || this.state.arrival === "") {
            fields.arrivalValidated = false;
            valid = false;
        }

        if(this.state.arrivalTime === undefined || this.state.arrivalTime === "") {
            fields.arrivalTimeValidated = false;
            valid = false;
        }

        if(this.state.price === undefined || this.state.price === "" || this.state.price <= 0) {
            fields.priceValidated = false;
            valid = false;
        }

        if(this.state.airplane === undefined || this.state.airplane === "" || this.state.airplane < 0) {
            fields.airplaneValidated = false;
            valid = false;
        }

        this.setState(fields);

        return valid;
    }

    addFlight() {
        if(!this.validate()) {
            this.setState({error: true, errorMessage: "Check fields again"})
            return;
        }

        let permissions = this.props.allCookies.user['permissions']
        let isAdmin = false;
        for(let i = 0; i < permissions.length; i++)
            if(permissions[i] === 'Admin')
                isAdmin = true;
        
        if(!isAdmin) {
            this.setState({error: true, errorMessage: 'You must be an admin to create flights'})
            return
        }

        axios.post('http://localhost:5000/staff_createnewflights', null, {
            params: {
                username: this.props.allCookies.user['username'],
                criteria: {
                    airline_name: this.props.allCookies.user['works'],
                    flight_num: this.state.flightNumber,
                    departure_airport: this.state.departure,
                    departure_time: this.state.departureTime,
                    arrival_airport: this.state.arrival,
                    arrival_time: this.state.arrivalTime,
                    price: this.state.price,
                    status: 'Upcoming',
                    airplane_id: this.state.airplane,
                }
            }
        }).then((res) => {
            let result = res.data;
            if(result[Constants.STATUS] === 0)
                this.setState({error: false, errorMessage: '', success: true, successMessage: result['result']});
            else
                this.setState({error: true, errorMessage: result[Constants.REASON], success: true, successMessage: ''});
        }).catch(() => {
            this.setState({error: true, errorMessage: 'Server error', success: false, successMessagege: ''});
        })
    }

    render() {
        return (
            <Container className="addFlightForm">
                <Label className="mb-3 mt-3 notification-success-list" hidden={!this.state.success}>
                    {this.state.successMessage}
                </Label>
                <Label className="mt-3 ml-0 notification-error-login" hidden={!this.state.error}>
                    {this.state.errorMessage}
                </Label>
                <Form.Group className="mb-3 mt-3">
                    <Form.Label>Flight number</Form.Label>
                    <Form.Control type="number" placeholder="Flight number" onChange={(e) => {
                        this.setState({flightNumber: e.target.value, flightNumberValidated : e.target.value > 0})
                    }}
                    isInvalid={!this.state.flightNumberValidated}/>
                </Form.Group>
                <Form.Group className="mb-3 mt-3">
                    <Form.Label>Departure airport</Form.Label>
                    <Typeahead
                        id="departure-field"
                        options={Airports.getAirportList()} 
                        placeholder="Airport"
                        onChange={(e) => {
                            if(e.length > 0)
                                this.setState({departure: e[0].airport, departureValidated: true}) 
                        }}
                        onInputChange={(e) => this.setState({departure: e, departureValidated: e !== ''})}
                        isInvalid={!this.state.departureValidated} />
                </Form.Group>
                <Form.Group className="mb-3 mt-3">
                    <Form.Label>Departure time</Form.Label>
                    <Form.Control type="datetime-local"
                        onChange={(e) => this.setState({departureTime: e.target.value, departureTimeValidated: e.target.value !== ''})}
                        isInvalid={!this.state.departureTimeValidated} />
                </Form.Group>
                <Form.Group className="mb-3 mt-3">
                    <Form.Label>Arrival airport</Form.Label>
                    <Typeahead
                        id="departure-field"
                        options={Airports.getAirportList()} 
                        placeholder="Airport"
                        onChange={(e) => {
                            if(e.length > 0)
                                this.setState({arrival: e[0].airport, arrivalValidated: true}) 
                        }}
                        onInputChange={(e) => this.setState({arrival: e})}
                        isInvalid={!this.state.arrivalValidated} />
                </Form.Group>
                <Form.Group className="mb-3 mt-3">
                    <Form.Label>Arrival time</Form.Label>
                    <Form.Control type="datetime-local"
                        onChange={(e) => this.setState({arrivalTime: e.target.value, arrivalTimeValidated: e.target.value !== ''})}
                        isInvalid={!this.state.arrivalTimeValidated} />
                </Form.Group>
                <Form.Group className="mb-3 mt-3">
                    <Form.Label>Price</Form.Label>
                    <Form.Control type="number"
                        onChange={(e) => this.setState({price: e.target.value, priceValidated: e.target.value > 0})}
                        isInvalid={!this.state.priceValidated} />
                </Form.Group>
                <Form.Group className="mb-3 mt-3">
                    <Form.Label>Airplane ID</Form.Label>
                    <Form.Control type="number"
                        onChange={(e) => this.setState({airplane: e.target.value, airplaneValidated: e.target.value > 0})}
                        isInvalid={!this.state.airplaneValidated} />
                </Form.Group>
                <Button className="mb-3 mt-3 testButton" onMouseUp={this.addFlight}> 
                    Create flight
                </Button>

            </Container>
        );
    }
}

function AddFlights() {
    const AddFlightsCookies = withCookies(AddFlightsClass);
    return <AddFlightsCookies />
}

export default AddFlights;