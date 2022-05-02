import "../css/Register.css";
import React from 'react';
import { Form, Container, Button, FloatingLabel as Label } from 'react-bootstrap';
import { Link, Navigate } from 'react-router-dom'
import { Constants } from "../Utils";
import { Cookies, withCookies } from 'react-cookie'
import { instanceOf } from 'prop-types'
import axios from 'axios'
import md5 from 'md5'

class RegisterClass extends React.Component {

    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };

    constructor(props) {
        super(props);

        this.state = { 
            registerAs: Constants.CUSTOMER,
            validated: false,
            passwordValidated: true,
            error: false,
            errorMessage: "",
            userValidated: true,
            fNameValidated: true,
            lNameValidated: true,
            passValidated: true,
            confirmValidated: true,
            dobValidated: true,
            buildingValidated: true,
            streetValidated: true,
            cityValidated: true,
            stateValidated: true,
            phoneValidated: true,
            passportValidated: true,
            passportExpiryValidated: true,
            passportCountryValidated: true,
            airlineValidated: true,
            agentIdValidated: true,
            registered: this.props.allCookies['registered']
        };

        this.register = this.register.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.validated = this.validated.bind(this);

        if(this.props.allCookies['registered'] !== undefined)
            this.props.cookies.remove('registered');
    }

    register() {
        console.log('registering')
        let agentParams = {
                type: this.state.registerAs,
                email: this.state.user,
                password: this.state.pass,
                booking_agent_id: this.state.agent_id
            };
        
        let staffParams = {
            type: this.state.registerAs,
            username: this.state.user,
            password: this.state.pass,
            first_name: this.state.fName,
            last_name: this.state.lName,
            works_for: this.state.airline,
            date_of_birth: this.state.dob
        }

        let customerParams = {
            type: this.state.registerAs,
            email: this.state.user,
            password: this.state.pass,
            name: this.state.fName,
            date_of_birth: this.state.dob,
            building_number: this.state.building,
            street: this.state.street,
            city: this.state.city,
            state: this.state.state,
            phone_number: this.state.phone,
            passport_number: this.state.passport,
            passport_expiration: this.state.passportExpiry,
        }

        axios.post('http://localhost:5000/register', null, {
            params: this.state.registerAs === Constants.STAFF ? staffParams : this.state.registerAs === Constants.AGENT ? agentParams : customerParams
        }).then(() => {
            const { cookies } = this.props;
            cookies.set('registered', 'true');
        }).catch((err) => {
            this.setState({error: true, errorMessage: "A server error occurred"});
        });
    }

    validated() {
        let fields = {
            userValidated: true,
            fNameValidated: true,
            lNameValidated: true,
            passValidated: true,
            confirmValidated: true,
            dobValidated: true,
            buildingValidated: true,
            streetValidated: true,
            cityValidated: true,
            stateValidated: true,
            phoneValidated: true,
            passportValidated: true,
            passportExpiryValidated: true,
            passportCountryValidated: true,
            airlineValidated: true,
            agentIdValidated: true,
        }

        let valid = true;

        if(this.state.user === "" || this.state.user === undefined) {
            fields.userValidated = false;
            valid = false;
        }

        if(this.state.pass === md5("") || this.state.pass === undefined) {
            fields.passValidated = false;
            valid = false;
        }

        if(this.state.confirm === undefined || this.state.pass !== this.state.confirm) {
            fields.confirmValidated = false;
            valid = false;
        }

        if(this.state.registerAs === Constants.STAFF) {
            if(this.state.fName === "" || this.state.fName === undefined) {
                fields.fNameValidated = false;
                valid = false;
            }
            if(this.state.lName === "" || this.state.lName === undefined) {
                fields.lNameValidated = false;
                valid = false;
            }
            if(this.state.airline === "" || this.state.airline === undefined) {
                fields.airlineValidated = false;
                valid = false;
            }
        } else if(this.state.registerAs === Constants.AGENT) {
            if(this.state.agent_id === "" || this.state.agent_id === undefined) {
                fields.agentIdValidated = false;
                valid = false;
            }
        } else if(this.state.registerAs === Constants.CUSTOMER) {
            if(this.state.fName === "" || this.state.fName === undefined) {
                fields.fNameValidated = false;
                valid = false;
            }
            if(this.state.dob === "" || this.state.dob === undefined) {
                fields.dobValidated = false;
                valid = false;
            }
            if(this.state.building === "" || this.state.building === undefined || this.state.building <= 0)  {
                fields.buildingValidated = false;
                valid = false;
            }
            if(this.state.street === "" || this.state.street === undefined) {
                fields.streetValidated = false;
                valid = false;
            }
            if(this.state.city === "" || this.state.city === undefined) {
                fields.cityValidated = false;
                valid = false;
            }
            if(this.state.state === "" || this.state.state === undefined) {
                fields.stateValidated = false;
                valid = false;
            }
            if(this.state.passport === "" || this.state.passport === undefined) {
                fields.passportValidated = false;
                valid = false;
            }
            if(this.state.passportExpiry === "" || this.state.passportExpiry === undefined) {
                fields.passportExpiryValidated = false;
                valid = false;
            }
            if(this.state.passportCountry === "" || this.state.passportCountry === undefined) {
                fields.passportCountryValidated = false;
                valid = false;
            }
            if(this.state.phone === "" || this.state.phone === undefined || this.state.phone <= 0) {
                fields.phoneValidated = false;
                valid = false;
            }
        }

        this.setState(fields);

        return valid;
    }

    onSubmit() {
        if(!this.validated()) {
            this.setState({error: true, errorMessage: "Please check the fields"});
            return;
        }
        
        this.register();
    }

    render() {
        if(this.state.registered === 'true')
            return <Navigate to={{pathname: '/login'}}/>

        return (
            <Container id="form">
                <Label className="mt-3 notification-error" hidden={!this.state.error}>
                    {this.state.errorMessage}
                </Label>
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
                <Form>
                    <Form.Group className="mb-3 mt-3">
                        <Form.Label>{this.state.registerAs === Constants.STAFF ? "Username" : "Email"}</Form.Label>
                        <Form.Control placeholder={this.state.registerAs === Constants.STAFF ? "Enter your username" : "Enter your email"}
                            onChange={(e) => {
                                this.setState({user: e.target.value});
                            }} 
                            required
                            isInvalid={this.state.user === "" || !this.state.userValidated}/>
                        <Form.Control.Feedback type="invalid">
                            This field must not be empty
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" hidden={this.state.registerAs === Constants.AGENT}>
                        <Form.Label>{this.state.registerAs === Constants.STAFF ? "First name" : "Name"}</Form.Label>
                        <Form.Control placeholder={this.state.registerAs === Constants.STAFF ? "Enter your first name" : "Enter your name"} 
                            onChange={(e) => {
                                this.setState({fName: e.target.value});
                            }}
                            required={this.state.registerAs !== Constants.AGENT}
                            isInvalid={this.state.fName === "" || !this.state.fNameValidated} />
                        <Form.Control.Feedback type="invalid">
                            This field must not be empty
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" hidden={this.state.registerAs !== Constants.STAFF}>
                        <Form.Label>Last name</Form.Label>
                        <Form.Control placeholder="Enter your last name"
                            onChange={(e) => {
                                this.setState({lName: e.target.value});
                            }} 
                            required={this.state.registerAs === Constants.STAFF}
                            isInvalid={this.state.lName === "" || !this.state.lNameValidated} />
                        <Form.Control.Feedback type="invalid">
                            This field must not be empty
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="Enter your password"
                            onChange={(e) => {
                                this.setState({pass: md5(e.target.value)});
                                if(md5(e.target.value) !== this.state.confirm)
                                    this.setState({passwordValidated: false});
                                else
                                    this.setState({passwordValidated: true});
                            }} 
                            required
                            isInvalid={this.state.pass === md5("") && !this.state.passValidated} />
                        <Form.Control.Feedback type="invalid">
                            This field must not be empty
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Confirm password</Form.Label>
                        <Form.Control type="password" placeholder="Confirm your password"
                            onChange={(e) => {
                                if(md5(e.target.value) !== this.state.pass)
                                    this.setState({passwordValidated: false});
                                else
                                    this.setState({passwordValidated: true});

                                this.setState({confirm: md5(e.target.value)});
                            }} 
                            isInvalid={(!this.state.passwordValidated && this.state.confirm !== "") || (!this.state.confirmValidated && !this.state.passwordValidated)}
                            required/>
                        <Form.Control.Feedback type="invalid">
                            Passwords do not match
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" hidden={this.state.registerAs !== Constants.CUSTOMER}>
                        <Form.Label>Building number</Form.Label>
                        <Form.Control type="number" placeholder="Enter your building number"
                            onChange={(e) => {
                                this.setState({building: e.target.value});
                            }} 
                            required={this.state.registerAs === Constants.CUSTOMER}
                            isInvalid={this.state.building <= 0 || this.state.building === "" || !this.state.buildingValidated}/>
                        <Form.Control.Feedback type="invalid">
                            Building number cannot be below 0 or empty
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" hidden={this.state.registerAs !== Constants.CUSTOMER}>
                        <Form.Label>Street</Form.Label>
                        <Form.Control placeholder="Enter your street name"
                            onChange={(e) => {
                                this.setState({street: e.target.value});
                            }}
                            required={this.state.registerAs === Constants.CUSTOMER}
                            isInvalid={this.state.street === "" || !this.state.streetValidated} />
                        <Form.Control.Feedback type="invalid">
                            This field must not be empty
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" hidden={this.state.registerAs !== Constants.CUSTOMER}>
                        <Form.Label>City</Form.Label>
                        <Form.Control placeholder="Enter your city name"
                            onChange={(e) => {
                                this.setState({city: e.target.value});
                            }}
                            required={this.state.registerAs === Constants.CUSTOMER}
                            isInvalid={this.state.city === "" || !this.state.cityValidated} />
                        <Form.Control.Feedback type="invalid">
                            This field must not be empty
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" hidden={this.state.registerAs !== Constants.CUSTOMER}>
                        <Form.Label>State</Form.Label>
                        <Form.Control placeholder="Enter your state name"
                            onChange={(e) => {
                                this.setState({state: e.target.value});
                            }} 
                            required={this.state.registerAs === Constants.CUSTOMER}
                            isInvalid={this.state.state === "" || !this.state.stateValidated} />
                        <Form.Control.Feedback type="invalid">
                            This field must not be empty
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" hidden={this.state.registerAs !== Constants.CUSTOMER}>
                        <Form.Label>Phone number</Form.Label>
                        <Form.Control type="number" placeholder="Enter your phone number"
                            onChange={(e) => {
                                this.setState({phone: e.target.value});
                            }} 
                            required={this.state.registerAs === Constants.CUSTOMER}
                            isInvalid={this.state.phone === "" || this.state.phone <= 0 || !this.state.phoneValidated} />
                        <Form.Control.Feedback type="invalid">
                            Invalid phone number
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" hidden={this.state.registerAs !== Constants.CUSTOMER}>
                        <Form.Label>Passport number</Form.Label>
                        <Form.Control placeholder="Enter your passport number"
                            onChange={(e) => {
                                this.setState({passport: e.target.value});
                            }}
                            required={this.state.registerAs === Constants.CUSTOMER}
                            isInvalid={this.state.passport === "" || !this.state.passportValidated} />
                        <Form.Control.Feedback type="invalid">
                            Invalid passport number
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" hidden={this.state.registerAs !== Constants.CUSTOMER}>
                        <Form.Label>Passport expiry date</Form.Label>
                        <Form.Control type="date"
                            onChange={(e) => {
                                this.setState({passportExpiry: e.target.value});
                            }}
                            required={this.state.registerAs === Constants.CUSTOMER} 
                            isInvalid={!this.state.passportExpiryValidated} />
                        <Form.Control.Feedback type="invalid">
                            Please pick a date
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" hidden={this.state.registerAs !== Constants.CUSTOMER}>
                        <Form.Label>Passport country</Form.Label>
                        <Form.Control placeholder="Enter your passport country"
                            onChange={(e) => {
                                this.setState({passportCountry: e.target.value});
                            }}
                            required={this.state.registerAs === Constants.CUSTOMER}
                            isInvalid={this.state.passportCountry === "" || !this.state.passportCountryValidated} />
                        <Form.Control.Feedback type="invalid">
                            This field must not be empty
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" hidden={this.state.registerAs !== Constants.CUSTOMER && this.state.registerAs !== Constants.STAFF}>
                        <Form.Label>Date of birth</Form.Label>
                        <Form.Control type="date"
                            onChange={(e) => {
                                this.setState({dob: e.target.value});
                            }}
                            required={this.state.registerAs !== Constants.AGENT}
                            isInvalid={!this.state.dobValidated} />
                        <Form.Control.Feedback type="invalid">
                            Please pick a date
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" hidden={this.state.registerAs !== Constants.STAFF}>
                        <Form.Label>Which airline do you work for?</Form.Label>
                        <Form.Control placeholder="Enter your airline name"
                            onChange={(e) => {
                                this.setState({airline: e.target.value});
                            }} 
                            required={this.state.registerAs === Constants.STAFF}
                            isInvalid={this.state.airline === "" || this.state.airlineValidated} />
                        <Form.Control.Feedback type="invalid">
                            This field must not be empty
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" hidden={this.state.registerAs !== Constants.AGENT}>
                        <Form.Label>ID</Form.Label>
                        <Form.Control placeholder="Enter your agent ID"
                            onChange={(e) => {
                                this.setState({agent_id: e.target.value});
                            }} 
                            required={this.state.registerAs === Constants.AGENT}
                            isInvalid={this.state.agent_id === "" || !this.state.agentIdValidated} />
                        <Form.Control.Feedback type="invalid">
                            This field must not be empty
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Button className="mb-3 mt-3" id="btnSubmit" onMouseUp={() => {this.onSubmit()}}>
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
    const RegisterCookies = withCookies(RegisterClass);
    return <RegisterCookies />
}

export default Register;