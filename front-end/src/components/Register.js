import "../css/Register.css";
import React from 'react';
import { Form, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom'
import { Constants } from "../Utils";

class RegisterClass extends React.Component {

    constructor(props) {
        super(props);

        this.state = { 
            registerAs: Constants.CUSTOMER,
            validated: false,
            confirm: ""
        };

        this.onSubmit = this.onSubmit.bind(this);
        this.register = this.register.bind(this);
    }

    onSubmit(e) {
        const form = e.currentTarget
        if(form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
        }

        this.setState({validated: true});
    }

    register() {
        console.log("asdfsd")
    }

    render() {
        if(this.state.validated)
            this.register();

        return (
            <Container id="form">
                <Form.Group className="mt-3">
                    <Form.Label>Register as</Form.Label>
                    <Form.Select onChange={(e) => {
                        if(e.target.value === "Airline staff") {
                            this.setState({registerAs: Constants.STAFF});
                        } else if(e.target.value === "Customer") {
                            this.setState({registerAs: Constants.CUSTOMER});
                        } else if(e.target.value === "Booking agent") {
                            this.setState({registerAs: Constants.AGENT});
                        }
                    }}>
                        <option>Customer</option>
                        <option>Airline staff</option>
                        <option>Booking agent</option>
                    </Form.Select>
                </Form.Group>
                <hr />
                <Form noValidate validated={this.state.validated} onSubmit={(e) => this.onSubmit(e)}>
                    <Form.Group className="mb-3 mt-3">
                        <Form.Label>{this.state.registerAs === Constants.STAFF ? "Username" : "Email"}</Form.Label>
                        <Form.Control placeholder={this.state.registerAs === Constants.STAFF ? "Enter your username" : "Enter your email"}
                            onChange={(e) => {
                                this.setState({user: e.target.value});
                            }} 
                            required/>
                    </Form.Group>

                    <Form.Group className="mb-3" hidden={this.state.registerAs === Constants.AGENT}>
                        <Form.Label>{this.state.registerAs === Constants.STAFF ? "First name" : "Name"}</Form.Label>
                        <Form.Control placeholder={this.state.registerAs === Constants.STAFF ? "Enter your first name" : "Enter your name"} 
                            onChange={(e) => {
                                this.setState({fName: e.target.value});
                            }}
                            required={this.state.registerAs !== Constants.AGENT}/>
                    </Form.Group>

                    <Form.Group className="mb-3" hidden={this.state.registerAs !== Constants.STAFF}>
                        <Form.Label>Last name</Form.Label>
                        <Form.Control placeholder="Enter your last name"
                            onChange={(e) => {
                                this.setState({lName: e.target.value});
                            }} 
                            required={this.state.registerAs === Constants.STAFF}/>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="Enter your password"
                            onChange={(e) => {
                                this.setState({pass: e.target.value});
                            }} 
                            required/>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Confirm password</Form.Label>
                        <Form.Control type="password" placeholder="Confirm your password"
                            onChange={(e) => {
                                this.setState({confirm: e.target.value});

                                if(e.target.value !== this.state.pass)
                                    this.setState({passValidated: false});
                                else
                                    this.setState({passValidated: true});
                            }} 
                            required
                            isInvalid={!this.state.passValidated && this.state.confirm !== ""}/>
                        <Form.Control.Feedback type="invalid">
                            Password not the same
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" hidden={this.state.registerAs !== Constants.CUSTOMER}>
                        <Form.Label>Building number</Form.Label>
                        <Form.Control type="number" placeholder="Enter your building number"
                            onChange={(e) => {
                                this.setState({building: e.target.value});
                            }} 
                            required={this.state.registerAs === Constants.CUSTOMER}/>
                    </Form.Group>

                    <Form.Group className="mb-3" hidden={this.state.registerAs !== Constants.CUSTOMER}>
                        <Form.Label>Street</Form.Label>
                        <Form.Control placeholder="Enter your street name"
                            onChange={(e) => {
                                this.setState({street: e.target.value});
                            }}
                            required={this.state.registerAs === Constants.CUSTOMER}/>
                    </Form.Group>

                    <Form.Group className="mb-3" hidden={this.state.registerAs !== Constants.CUSTOMER}>
                        <Form.Label>City</Form.Label>
                        <Form.Control placeholder="Enter your city name"
                            onChange={(e) => {
                                this.setState({city: e.target.value});
                            }}
                            required={this.state.registerAs === Constants.CUSTOMER}/>
                    </Form.Group>

                    <Form.Group className="mb-3" hidden={this.state.registerAs !== Constants.CUSTOMER}>
                        <Form.Label>State</Form.Label>
                        <Form.Control placeholder="Enter your state name"
                            onChange={(e) => {
                                this.setState({state: e.target.value});
                            }} 
                            required={this.state.registerAs === Constants.CUSTOMER}/>
                    </Form.Group>

                    <Form.Group className="mb-3" hidden={this.state.registerAs !== Constants.CUSTOMER}>
                        <Form.Label>Phone number</Form.Label>
                        <Form.Control type="number" placeholder="Enter your phone number"
                            onChange={(e) => {
                                this.setState({phone: e.target.value});
                            }} 
                            required={this.state.registerAs === Constants.CUSTOMER}/>
                    </Form.Group>

                    <Form.Group className="mb-3" hidden={this.state.registerAs !== Constants.CUSTOMER}>
                        <Form.Label>Passport number</Form.Label>
                        <Form.Control placeholder="Enter your passport number"
                            onChange={(e) => {
                                this.setState({passport: e.target.value});
                            }}
                            required={this.state.registerAs === Constants.CUSTOMER}/>
                    </Form.Group>

                    <Form.Group className="mb-3" hidden={this.state.registerAs !== Constants.CUSTOMER}>
                        <Form.Label>Passport expiry date</Form.Label>
                        <Form.Control type="date"
                            onChange={(e) => {
                                this.setState({passportExpiry: e.target.value});
                            }}
                            required={this.state.registerAs === Constants.CUSTOMER}/>
                    </Form.Group>

                    <Form.Group className="mb-3" hidden={this.state.registerAs !== Constants.CUSTOMER}>
                        <Form.Label>Passport country</Form.Label>
                        <Form.Control placeholder="Enter your passport country"
                            onChange={(e) => {
                                this.setState({passportCountry: e.target.value});
                            }}
                            required={this.state.registerAs === Constants.CUSTOMER}/>
                    </Form.Group>

                    <Form.Group className="mb-3" hidden={this.state.registerAs !== Constants.CUSTOMER && this.state.registerAs !== Constants.STAFF}>
                        <Form.Label>Date of birth</Form.Label>
                        <Form.Control type="date"
                            onChange={(e) => {
                                this.setState({dob: e.target.value});
                            }} 
                            required={this.state.registerAs !== Constants.AGENT}/>
                    </Form.Group>

                    <Form.Group className="mb-3" hidden={this.state.registerAs !== Constants.STAFF}>
                        <Form.Label>Which airline do you work for?</Form.Label>
                        <Form.Control placeholder="Enter your airline name"
                            onChange={(e) => {
                                this.setState({airline: e.target.value});
                            }} 
                            required={this.state.registerAs === Constants.STAFF}/>
                    </Form.Group>

                    <Button className="mb-3 mt-3" id="btnSubmit" type="submit">
                        Register
                    </Button>
                </Form>
                <hr />
                <Container id="footer">
                    <Link to="/login" variant="body2" className="mb-3" id="redirect-link">
                        Already have an account?
                    </Link>
                </Container>
            </Container>
        );
    }
}

function Register() {
    return <RegisterClass />
}

export default Register;