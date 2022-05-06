import "../css/SearchFlights.css"
import React from 'react';
import { withCookies, Cookies } from 'react-cookie'
import { Container, Form, Button, FloatingLabel as Label } from 'react-bootstrap'
import { instanceOf } from 'prop-types'
import { Airports, Constants } from '../Utils'
import { Typeahead } from 'react-bootstrap-typeahead'
import axios from "axios";
import { Navigate } from "react-router-dom"
import FlightList from './FlightList'

class SearchClass extends React.Component {

    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            arrivalValidated: true,
            departureValidated: true,
            dateValidated: true,
            arrival: "",
            departure: "",
            flights: [],
            error: false,
            success: false
        }

        this.validate = this.validate.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.search = this.search.bind(this);
        this.purchaseFlightTicket = this.purchaseFlightTicket.bind(this);
    }

    onSubmit() {
        if(!this.validate()) {
            this.setState({error: true, errorMessage: "Check the fields again"})
            return;
        }

        this.search();
    }

    search() {
        axios.get("http://localhost:5000/search", {
            params: {
                arrival: this.state.arrival,
                departure: this.state.departure,
                date: this.state.date
            }
        }).then((res) => {
            let flightResults = res.data.flights;

            if(flightResults.length === 0) {
                this.setState({error: true, errorMessage: "No flights found", flights: [], success: false, successMessage: ''})
            } else {
                let state = {
                    error: false,
                    errorMessage: "",
                    success: false,
                    successMessage: "",
                    flights: flightResults
                }
                this.setState(state)
            }
        }).catch((e) => {
            this.setState({error: true, errorMessage: "A server error occurred", flights: []})
        });
    }

    validate() {
        let valid = true;

        let fields = {
            arrivalValidated: true,
            departureValidated: true,
            dateValidated: true
        }

        if(this.state.arrival === undefined || this.state.arrival === "") {
            fields.arrivalValidated = false;
            valid = false;
        }

        if(this.state.departure === undefined || this.state.departure === "") {
            fields.departureValidated = false;
            valid = false;
        }

        if(this.state.date === undefined || this.state.date === "") {
            fields.dateValidated = false;
            valid = false;
        }

        fields.arrivalValidated = Airports.has(this.state.arrival);
        fields.departureValidated = Airports.has(this.state.departure);

        if(this.state.arrival === this.state.departure) {
            fields.arrivalValidated = false;
            fields.departureValidated = false;
            valid = false;
        }

        this.setState(fields);

        return valid;
    }

    purchaseFlightTicket(info) {
        if(this.props.allCookies['user'] === 'null') {
            this.setState({loggedIn: false})
            return;
        }

        axios.post('http://localhost:5000/customer_purchasetickets', null, {
            params: {
                email: this.props.allCookies['user']['email'],
                airline_name: info.airline_name,
                flight_num: info.flight_num
            }
        }).then((res) => {
            let response = res['data'];

            if(response[Constants.STATUS] === 0)
                this.setState({error: false, errorMessage: '', success: true, successMessage: response['result']});
            else
                this.setState({error: true, errorMessage: response[Constants.REASON], success: false, successMessage: ''});
            console.log(res)
        }).catch(() => {
            this.setState({error: true, errorMessage: 'Server error', success: false, successMessage: ''})
        });
    }

    render() {
        if(this.state.loggedIn !== undefined) {
            if(!this.state.loggedIn) {
                return <Navigate to={{pathname: '/login'}} />;
            }
        }

        return (
            <Container id="searchContainer">
                <h1 style={{'margin-bottom': '20px'}}>Search Flights</h1>
                <hr></hr>

                <Label className="mb-3 notification-success-list" hidden={!this.state.success}>
                    {this.state.successMessage}
                </Label>
                <Label className="mt-3 mb-3 notification-error-search" hidden={!this.state.error}>
                    {this.state.errorMessage}
                </Label>
                <Container id="searchForm" className="pt-3 pb-3">
                    <Form.Group className="mb-3 airportfield">
                        <Form.Label>From</Form.Label>
                        <Typeahead 
                            id="arrival-field"
                            options={Airports.getAirportList()} 
                            placeholder="Airport"
                            onChange={(e) => {
                                if(e.length > 0)
                                    this.setState({departure: e[0].airport}) 
                            }}
                            onInputChange={(e) => this.setState({departure: e})} 
                            isInvalid={!this.state.departureValidated} />
                    </Form.Group>
                    <Form.Group className="mb-3 airportfield">
                        <Form.Label>To</Form.Label>
                        <Typeahead
                            id="departure-field"
                            options={Airports.getAirportList()} 
                            placeholder="Airport"
                            onChange={(e) => {
                                if(e.length > 0)
                                    this.setState({arrival: e[0].airport}) 
                            }}
                            onInputChange={(e) => this.setState({arrival: e})}
                            isInvalid={!this.state.arrivalValidated} />
                        <Form.Control.Feedback type="invalid">
                            Invalid airport
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3 datefield" >
                        <Form.Label>Departure Date</Form.Label>
                        <Form.Control type="date" onChange={(e) => {
                            this.setState({date: e.target.value});
                        }}
                        isInvalid={!this.state.dateValidated}/>
                        <Form.Control.Feedback>
                            Invalid date
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Button className="mb-3 mt-3" id="btnSubmitSearch" onMouseUp={this.onSubmit}>
                        Search
                    </Button>
                </Container>
                <Container className="mt-5 ps-0 pe-0" id="flightlist">
                    {
                        this.state.flights.length > 0 ? this.state.flights.map((data) => {
                                return (
                                        <FlightList info={data} purchaseFlightTicket={this.purchaseFlightTicket}>
                                            <Button onMouseUp={() => this.purchaseFlightTicket(data)} className="purchaseTicketButton">Purchase</Button>
                                        </FlightList>
                                       );
                            }) : ''
                    }
                </Container>
            </Container>
        )
    }
}

function Search() {

    const SearchCookies = withCookies(SearchClass);

    return (
        <SearchCookies />
    );
}

export default Search;