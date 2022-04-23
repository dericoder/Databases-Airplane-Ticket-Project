import "./Login.css"
import React from 'react'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

class LoginClass extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            user: "",
            pass: ""
        };

        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit() {
        console.log("Good");
    }

    encryptPassword() {

    }

    render() {
        return (
            <Container id="form">
                <Form onSubmit={this.onSubmit}>
                    <Form.Group className="mb-3 mt-3" controlId="formEmail">
                        <Form.Label>Email / Username</Form.Label>
                        <Form.Control type="email" placeholder="Enter your email or username" onChange={(e) => this.setState({user: e.target.value})} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="Enter your password" />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formUserType">
                        <Form.Label>Login as</Form.Label>
                        <Form.Select>
                            <option>Customer</option>
                            <option>Airline staff</option>
                            <option>Booking agent</option>
                        </Form.Select>
                    </Form.Group>
                    <Button className="mb-3" id="btnSubmit" type="submit">
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