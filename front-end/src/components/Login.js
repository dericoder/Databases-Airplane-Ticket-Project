import "../css/Login.css"
import React from 'react'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Label from 'react-bootstrap/FloatingLabel'
import axios from 'axios'
import { Staff, Constants, Customer, Agent } from '../Utils' 
import { Navigate, Link } from "react-router-dom"
import { withCookies } from 'react-cookie'
import { instanceOf } from 'prop-types'
import { Cookies } from 'react-cookie'
import md5 from 'md5'

class LoginClass extends React.Component {

    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            type: Constants.CUSTOMER,
            error: false,
            errorMessage: "",
            loggedIn: false,
            user: this.props.allCookies['user']
        }

        this.onSubmit = this.onSubmit.bind(this);
        this.login = this.login.bind(this);
        this.validated = this.validated.bind(this);
   }

    login() {
        axios.get('http://localhost:5000/login', {
            params: {
                type: this.state.type,
                user: this.state.username,
                password: this.state.pass 
            }
        }).then((res) => {
            let response = res['data'];
            let user = null;
            if(response[Constants.STATUS] === Constants.SUCCESS) {
                if(this.state.type === Constants.STAFF)
                    user = new Staff(response[Constants.STAFF_USERNAME],
                                    response[Constants.STAFF_FNAME],
                                    response[Constants.STAFF_LNAME],
                                    response[Constants.STAFF_DOB],
                                    response[Constants.STAFF_WORKS]);
                else if(this.state.type === Constants.CUSTOMER)
                    user = new Customer(response[Constants.CUSTOMER_EMAIL],
                                        response[Constants.CUSTOMER_NAME],
                                        response[Constants.CUSTOMER_BUILDING],
                                        response[Constants.CUSTOMER_STREET],
                                        response[Constants.CUSTOMER_CITY],
                                        response[Constants.CUSTOMER_STATE],
                                        response[Constants.CUSTOMER_PHONE],
                                        response[Constants.CUSTOMER_PASSPORT],
                                        response[Constants.CUSTOMER_PASSPORT_EXPIRY],
                                        response[Constants.CUSTOMER_PASSPORT_COUNTRY],
                                        response[Constants.CUSTOMER_DOB]);
                else if(this.state.type === Constants.AGENT)
                        user = new Agent(response[Constants.AGENT_EMAIL], response[Constants.AGENT_ID]);

                const { cookies } = this.props;
                cookies.set('user', user);
                cookies.set('type', this.state.type);
            } else {
                this.setState({error: true, errorMessage: response[Constants.REASON]})
            }
        }).catch((e) => {
            this.setState({error: true, errorMessage: "A server error occurred"})
        });
    }

    validated() {
        if(this.state.username === "" || this.state.username === undefined)
            return false;

        if(this.state.pass === md5("") || this.state.pass === undefined)
            return false;

        return true;
    }

    onSubmit() {
        if(!this.validated()) {
            this.setState({error: true, errorMessage: "Please check the fields"});
            return;
        }
        
        this.login();
    }

    render() {
        if(this.state.user !== 'null')
            return <Navigate to={{pathname: '/'}} />;

        return (
            <Container id="form">
                <Label className="mt-3 ml-0 notification-error" hidden={!this.state.error}>
                    {this.state.errorMessage}
                </Label>

                <Form.Group className="mt-3 mb-3" controlId="formUserType">
                    <Form.Label>Login as</Form.Label>
                    <Form.Select onChange={(e) => {
                        if(e.target.value === "Airline staff")
                            this.setState({type: Constants.STAFF});
                        else if(e.target.value === "Customer") 
                            this.setState({type: Constants.CUSTOMER});
                        else if(e.target.value === "Booking agent")
                            this.setState({type: Constants.AGENT});
                    }}>
                        <option>Customer</option>
                        <option>Airline staff</option>
                        <option>Booking agent</option>
                    </Form.Select>
                </Form.Group>
                <hr />
                <Form>
                    <Form.Group className="mb-3" controlId="formEmail">
                        <Form.Label>Email / Username</Form.Label>
                        <Form.Control type="email" placeholder="Enter your email or username" 
                                    onChange={(e) => {
                                        this.setState({username: e.target.value});
                                    }} 
                                    required 
                                    isInvalid={this.state.username === ""} />
                        <Form.Control.Feedback type="invalid">
                            This field must not be empty
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" >
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="Enter your password"  
                                    onChange={(e) => {
                                        this.setState({pass: md5(e.target.value)})
                                    }}
                                    required 
                                    isInvalid={this.state.pass === md5("")} />
                        <Form.Control.Feedback type="invalid">
                            This field must not be empty
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Button className="mb-3 mt-3" id="btnSubmit" onMouseUp={this.onSubmit}>
                        Login
                    </Button>
                    <hr />
                    <Container className="mb-3" id="footer">
                        <Link to="/register" variant="body2" className="mb-3" id="redirect-link">
                            Don't have an account?
                        </Link>
                        <Link to="/forgot_password" variant="body2" id="redirect-link">
                            Forgot password?
                        </Link>
                    </Container>

                </Form>
            </Container>
        );
    }
}

function Login(props) {
    const LoginCookies = withCookies(LoginClass);
    return <LoginCookies updateNavbar={props.updateNavbar} />;
}

export default withCookies(Login);