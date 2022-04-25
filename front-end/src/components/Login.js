import "../css/Login.css"
import React from 'react'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Label from 'react-bootstrap/FloatingLabel'
import axios from 'axios'
import bcrypt from 'bcryptjs'
import { Connection, Staff, Constants } from '../Utils' 
import { Navigate, Link } from "react-router-dom"

class LoginClass extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            user: "",
            pass: "",
            type: Constants.CUSTOMER,
            error: false,
            errorMessage: "",
            loggedIn: Connection.loggedIn['status']
        }

        this.onSubmit = this.onSubmit.bind(this);
        this.encryptPassword = this.encryptPassword.bind(this);
    }

    onSubmit() {
        if(this.state.user === "" || this.state.pass === "") {
            this.setState({error: true, errorMessage: "All fields must not be empty"});
            return;
        }

        axios.get('http://localhost:5000/login', {
            params: {
                type: this.state.type,
                user: this.state.user,
                password: this.state.pass 
            }
        }).then((res) => {
            let response = res['data']
            console.log(response);
            if(response[Constants.STATUS] === Constants.SUCCESS) {
                Connection.loggedIn[Constants.STATUS] = true;
                if(this.state.type === Constants.STAFF)
                    Connection.loggedIn['user'] = new Staff(response[Constants.STAFF_USERNAME],
                                                            response[Constants.STAFF_FNAME],
                                                            response[Constants.STAFF_LNAME],
                                                            response[Constants.STAFF_DOB],
                                                            response[Constants.STAFF_WORKS]);
                                    
                Connection.loggedIn['type'] = this.state.type;

                this.props.updateNavbar();
                this.setState({loggedIn: true});
            } else{
                this.setState({error: true, errorMessage: response[Constants.REASON]});
            }
        }).catch(() => {
            this.setState({error: true, errorMessage: "A server error occurred"})
        });
    }

    encryptPassword(pass) {
        if(pass === "")
            return;
    }

    render() {
        if(Connection.loggedIn[Constants.STATUS])
            return <Navigate to={{pathname: '/'}} />;

        return (
            <Container id="form">
                <Label className="mt-3 notification-error" hidden={!this.state.error}>
                    {this.state.errorMessage}
                </Label>
                <Form>
                    <Form.Group className="mb-3 mt-3" controlId="formEmail">
                        <Form.Label>Email / Username</Form.Label>
                        <Form.Control type="email" placeholder="Enter your email or username" onChange={(e) => this.setState({user: e.target.value})} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="Enter your password"  
                        onChange={(e) => {
                                this.setState({pass: e.target.value})
                            }
                        }/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formUserType">
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
                    <Button className="mb-3 mt-3" id="btnSubmit" onMouseUp={() => {this.onSubmit()}}>
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
    return <LoginClass updateNavbar={props.updateNavbar}/>;
}

export default Login;