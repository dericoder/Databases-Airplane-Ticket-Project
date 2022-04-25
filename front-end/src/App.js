import "./App.css"
import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Container from 'react-bootstrap/Container';
import { Routes,  Route, Link } from 'react-router-dom'
import Login from './components/Login'
import Home from './components/Home'
import { Connection } from './Utils'
import Register from "./components/Register";

class Bar extends React.Component {

  constructor(props) {
    super(props);

    this.state = { loggedIn: false };
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }

  login() {
    this.setState({loggedIn: true});
  }

  logout() {
    this.setState({loggedIn: false});
  }

  render() {
    return (
      <div>
        <Navbar bg="light" expand="lg">
          <Container>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link as={Link} to={"/"}>Home</Nav.Link>
              </Nav>
              <Nav className="justify-content-end">
                <Nav.Link as={Link} to={"/login"}>{ Connection.loggedIn['status'] ? 'Hello, ' + Connection.loggedIn['user'].username : 'Login/Register' }</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <Routes>
          <Route path='/login' caseSensitive={false} element={<Login updateNavbar={() => {this.login()}}/>} />
          <Route path='/register' caseSensitive={false} element={<Register />} />
          <Route path='/' caseSensitive={false} element={<Home />} />
        </Routes>
      </div>
    );
  }
}

function App() {
  return (
    <>
      <Bar />
    </>
  );
}

export default App;
