import "../css/SearchFlights.css"
import React from 'react';
import { withCookies, Cookies } from 'react-cookie'
import { Container, Form, Button, FloatingLabel as Label, Modal } from 'react-bootstrap'
import { instanceOf } from 'prop-types'
import { Airports, Constants, Flight } from '../Utils'
import { Typeahead } from 'react-bootstrap-typeahead'
import axios from "axios";
import { Navigate } from "react-router-dom"
import FlightList from './FlightList'

/*
    TODO:
    1. Booking agent cannot buy if they are not added into an airline yet
*/
class SearchClass extends React.Component {

    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            popupShow: false,
            arrivalValidated: true,
            departureValidated: true,
            dateValidated: true,
            endDateValidated: true,
            arrival: "",
            departure: "",
            date: "",
            endDate: "",
            flights: [],
            error: false,
            success: false,
            customer: "",
            flightStatus: "Upcoming"
        }

        if(this.props.allCookies['type'] === Constants.STAFF.toString()) {
            axios.get('http://localhost:5000/staff_viewmyflights', {
                params: {
                    airline_name: this.props.allCookies.user['works'],
                    arrival: '',
                    departure: '',
                    startDate: '',
                    endDate: ''
                }
            }).then((res) => {
                let result = res.data;
                this.setState({flights: result['result1']})
            }).catch(() => {
                console.log("error");
            });
        }

        this.validate = this.validate.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.search = this.search.bind(this);
        this.purchaseFlightTicket = this.purchaseFlightTicket.bind(this);
        this.agentPurchase = this.agentPurchase.bind(this);
        this.editFlight = this.editFlight.bind(this);
    }

    onSubmit() {
        if(!this.validate()) {
            this.setState({error: true, errorMessage: "Check the fields again"})
            return;
        }

        this.search();
    }

    search() {
        if(this.props.allCookies['type'] !== Constants.STAFF.toString()) {
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
            }).catch(() => {
                this.setState({error: true, errorMessage: "A server error occurred", flights: []})
            });
        } else {
            axios.get('http://localhost:5000/staff_viewmyflights', {
                params: {
                    airline_name: this.props.allCookies.user['works'],
                    arrival: this.state.arrival,
                    departure: this.state.departure,
                    startDate: this.state.date,
                    endDate: this.state.endDate
                }
            }).then((res) => {
                let flightResults = res.data.result1;

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
                    this.setState(state);
                }
            }).catch(() => {
                console.log("error");
            })
        }
    }

    validate() {
        let valid = true;

        let fields = {
            arrivalValidated: true,
            departureValidated: true,
            dateValidated: true,
            endDateValidated: true
        }

        if(this.props.allCookies['type'] !== Constants.STAFF.toString()) {
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
        } else {
            if(this.state.date !== "" && this.state.endDate === "") {
                fields.dateValidated = false;
                fields.endDateValidated = false;
                valid = false;
            }
        }

        this.setState(fields);

        return valid;
    }

    editFlight() {
        let isAdmin = false;
        let permissions = this.props.allCookies['user']['permissions'];
        console.log(permissions)
        for(let i = 0; i < permissions.length; i++)
            if(permissions[i] === Constants.STAFF_OPERATOR)
                isAdmin = true;

        if(!isAdmin) {
            this.setState({error: true, errorMessage: "You must be an operator to make changes", editPopupShow: false})
            return;
        }

        axios.post('http://localhost:5000/staff_changestatus', null, {
            params: {
                username: this.props.allCookies['user'][Constants.STAFF_USERNAME],
                airline_name: this.props.allCookies['user']['works'],
                flight_num: this.state.flightInfo[Flight.NUMBER],
                status: this.state.flightStatus
            }
        }).then((res) => {
            let result = res.data;
            console.log(result['status']);
            if(result[Constants.STATUS] === 0) {
                this.setState({error: false, errorMessage: '', success: true, successMessage: 'Successfully changed flight status', editPopupShow: false})
            } else {
                this.setState({error: true, errorMessage: result[Constants.REASON], success: false, successMessage: '', editPopupShow: false});
            }
        }).catch(() => {
            this.setState({error: true, errorMessage: "Server error", success: false, successMessage: '', editPopupShow: false})
        })
    }

    purchaseFlightTicket(info) {
        if(this.props.allCookies['user'] === 'null') {
            this.setState({loggedIn: false})
            return;
        }

        if(this.props.allCookies['type'] === Constants.CUSTOMER.toString())
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
        else if(this.props.allCookies['type'] === Constants.AGENT.toString()) {
            this.setState({popupShow: true})
        }
    }

    agentPurchase() {
        let info = this.state.flightInfo;

        axios.post('http://localhost:5000/bookingagent_purchasetickets', null, {
            params: {
                email: this.props.allCookies['user']['email'],
                customer: this.state.customer,
                airline_name: info.airline_name,
                flight_num: info.flight_num
            }
        }).then((res) =>  {
            let response = res['data'];

            if(response[Constants.STATUS] === 0)
                this.setState({error: false, errorMessage: '', success: true, successMessage: response['result'], popupShow: false, customer: ''});
            else
                this.setState({error: true, errorMessage: response[Constants.REASON], success: false, successMessage: '', popupShow: false, customer: ''});
            console.log(res)
        }).catch(() => {
            this.setState({error: true, errorMessage: 'Server error', success: false, successMessage: '', popupShow: false, customer: ''})
        });
    }

    render() {
        if(this.state.loggedIn !== undefined) {
            if(!this.state.loggedIn) {
                return <Navigate to={{pathname: '/login'}} />;
            }
        }

        let i = -1;
        return (
            <Container id="searchContainer">
                <h1 style={{'marginBottom': '20px'}}>Search Flights</h1>
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
                        <Form.Label>{this.props.allCookies['type'] === Constants.STAFF.toString() ? "Start date" : "Departure Date"}</Form.Label>
                        <Form.Control type="date" onChange={(e) => {
                            this.setState({date: e.target.value});
                        }}
                        isInvalid={!this.state.dateValidated}/>
                        <Form.Control.Feedback>
                            Invalid date
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3 datefield" hidden={this.props.allCookies['type'] !== Constants.STAFF.toString()}>
                        <Form.Label>End Date</Form.Label>
                        <Form.Control type="date" onChange={(e) => {
                            this.setState({endDate: e.target.value});
                        }}
                        isInvalid={!this.state.endDateValidated}/>
                        <Form.Control.Feedback>
                            Invalid date
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Button className="mb-3 mt-3" id="btnSubmitSearch" onMouseUp={this.onSubmit}>
                        Search
                    </Button>
                    <Modal
                        size="lg"
                        aria-labelledby="contained-modal-title-vcenter"
                        centered
                        show={this.state.popupShow}
                        onHide={() => this.setState({popupShow: false})}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title id="contained-modal-title-vcenter">
                                Insert customer email
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form.Control type="text" placeholder="Customer email" onChange={(e) => this.setState({customer: e.target.value})} />
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={this.agentPurchase}>Purchase</Button>
                            <Button onClick={() => this.setState({popupShow: false})}>Close</Button>
                        </Modal.Footer>
                    </Modal>
                    <Modal
                        size="lg"
                        aria-labelledby="contained-modal-title-vcenter"
                        centered
                        show={this.state.editPopupShow}
                        onHide={() => this.setState({editPopupShow: false})}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title id="contained-modal-title-vcenter">
                                Change flight status
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form.Select onChange={(e) => {
                                this.setState({flightStatus: e.target.value});
                            }}>
                                <option>Upcoming</option>
                                <option>Delayed</option>
                                <option>In progress</option>
                                <option>Finished</option>
                            </Form.Select>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={() => this.editFlight()}>Change</Button>
                            <Button onClick={() => this.setState({editPopupShow: false})}>Close</Button>
                        </Modal.Footer>
                    </Modal>
                </Container>
                <Container className="mt-5 ps-0 pe-0" id="flightlist">
                    {
                        this.state.flights.length > 0 ? this.state.flights.map((data) => {
                                i = i + 1;
                                return (
                                        <FlightList key={i} onMouseUp={() => {
                                                if(this.props.allCookies['type'] === Constants.STAFF.toString())
                                                    this.setState({editPopupShow: true, flightInfo: data});
                                            }} info={data} purchaseFlightTicket={this.purchaseFlightTicket}>
                                            {this.props.allCookies['type'] !== Constants.STAFF.toString() ? <Button onMouseUp={() => {
                                                    this.purchaseFlightTicket(data);
                                                }} 
                                                className="purchaseTicketButton">Purchase</Button> : ''
                                            }
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