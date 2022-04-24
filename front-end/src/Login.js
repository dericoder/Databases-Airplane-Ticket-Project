import "./Login.css"
import React from 'react'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import axios from 'axios'
import bcrypt from 'bcryptjs'

class LoginClass extends React.Component {

    static CUSTOMER = 1;
    static AGENT = 2;
    static STAFF = 3;

    constructor(props) {
        super(props);

        this.state = {
            user: "",
            pass: "",
            type: LoginClass.CUSTOMER
        }

        this.onSubmit = this.onSubmit.bind(this);
        this.encryptPassword = this.encryptPassword.bind(this);
    }

    onSubmit() {

        axios.get('http://localhost:5000/login', {
            params: {
                type: this.state.type,
                user: this.state.user,
                password: this.state.pass 
            }
        }).then((res) => {
            console.log(res['data']);
        }).catch((err) => {
            console.log(err.response);
        });
    }

    encryptPassword(pass) {
        if(pass === "")
            return;
    }

    render() {
        return (
            <Container id="form">
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
                                this.setState({type: LoginClass.STAFF});
                            else if(e.target.value === "Customer") 
                                this.setState({type: LoginClass.CUSTOMER});
                            else if(e.target.value === "Booking agent")
                                this.setState({type: LoginClass.AGENT});
                        }}>
                            <option>Customer</option>
                            <option>Airline staff</option>
                            <option>Booking agent</option>
                        </Form.Select>
                    </Form.Group>
                    <Button className="mb-3" id="btnSubmit" onMouseUp={this.onSubmit}>
                        Login
                    </Button>
                </Form>
            </Container>
        );
    }
}

function Login() {
    return <LoginClass />;
}

export default Login;