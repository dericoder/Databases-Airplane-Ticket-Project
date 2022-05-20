import "../css/AirlineCustomer.css"
import React from 'react'
import { withCookies } from 'react-cookie'
import axios from 'axios'
import { Container, FloatingLabel as Label, Form, Button, FormControl, ListGroupItem, ListGroup, Modal } from 'react-bootstrap'
import Comp from './Comp'

class AirlineCustomerClass extends Comp {

    constructor(props) {
        super(props);

        this.state = {
            frequentCustomers: [{'customer_email': ''}],
            customers: [],
            customerFlights: [],
            customer: "",
            popupShow: false
        }

        axios.get('http://localhost:5000/staff_viewfrequentcustomers', {
            params: {
                username: this.props.allCookies.user.username,
                airline_name: this.props.allCookies.user.works
            }
        }).then((res) => {
            this.setState({frequentCustomers: res.data.result1});
        }).catch(() => {
            console.log("error");
        });

        this.searchCustomers = this.searchCustomers.bind(this);
        this.viewCustomerFlights = this.viewCustomerFlights.bind(this);
    }

    searchCustomers() {
        if(this.state.customer === "") {
            this.setState({customers: []});
            return;
        }

        axios.get('http://localhost:5000/search_customer', {
            params: {
                customer: this.state.customer
            }
        }).then((res) => {
            this.setState({customers: res.data.customers});
        }).catch(() => {
            console.log("error");
        });
    }

    viewCustomerFlights(email) {
        console.log(email);
        axios.get('http://localhost:5000/staff_viewcustomerflights', {
            params: {
                customer_email: email,
                airline_name: this.props.allCookies.user.works
            }
        }).then((res) => {
            this.setState({popupShow: true, customerFlights: res.data.result});
        }).catch(() => {
            console.log("error");
        })
    }

    render() {
        return (
            <Container className="airlineCustomerContainer">
                <h1>Most frequent customer:</h1>
                <Label className="mb-5" style={{'fontSize': '30px'}}>{this.state.frequentCustomers[0]['customer_email']}</Label>
                <Form className="d-flex mb-3">
                    <FormControl
                        type="search"
                        placeholder="Search customer email"
                        className="me-2"
                        aria-label="Search"
                        onChange={(e) => {
                            this.setState({customer: e.target.value})
                        }} />
                    <Button onMouseUp={this.searchCustomers}>Search</Button>
                </Form>
                <ListGroup>
                    {
                        this.state.customers.map((info) => {
                            return (
                                <ListGroupItem action onClick={() => {
                                        this.viewCustomerFlights(info.email);
                                    }
                                } style={{'textAlign': 'left'}}>{info.email}</ListGroupItem>
                            );
                        })
                    }
                </ListGroup>
                <Modal
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={this.state.popupShow}
                    onHide={() => this.setState({popupShow: false})}
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Flights
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ListGroup>
                            {
                                this.state.customerFlights.map((info) => {
                                    return (
                                        <ListGroupItem>{info.flight_num}</ListGroupItem>
                                    );
                                })
                            }
                        </ListGroup>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => this.setState({popupShow: false})}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        );
    }
}

function AirlineCustomer() {
    const AirlineCustomerCookie = withCookies(AirlineCustomerClass);
    return <AirlineCustomerCookie />
}

export default AirlineCustomer;