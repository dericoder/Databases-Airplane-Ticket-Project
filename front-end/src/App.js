import "./App.css"
import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Container from 'react-bootstrap/Container';
import { Routes,  Route, Link } from 'react-router-dom'
import Login from './components/Login'
import Home from './components/Home'
import Register from "./components/Register";
import { Cookies, useCookies, withCookies } from 'react-cookie'
import { instanceOf } from 'prop-types'

class Bar extends React.Component {
    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };

  constructor(props) {
    super(props);

    this.state = { 
      user: this.props.allCookies['user']
    };
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
                <Nav.Link as={Link} to={"/login"}>{ this.state.user !== 'null' ? 'Hello, ' + (this.state.user['email'] === undefined ? this.state.user['username'] : this.state. user['email']) : 'Login/Register' }</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <Routes>
          <Route path='/login' caseSensitive={false} element={<Login updateNavbar={() => {this.login()}} />} />
          <Route path='/register' caseSensitive={false} element={<Register />} />
          <Route path='/' caseSensitive={false} element={<Home />} />
        </Routes>
      </div>
    );
  }
}

function App() {
  const [cookies, setCookie, removeCookie] = useCookies(['cookie']);

  if(cookies['user'] === undefined)
    setCookie('user', null);
  const NavBar = withCookies(Bar);

  return (
    <NavBar />
  );
}

export default withCookies(App);
