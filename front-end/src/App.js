import "./App.css"
import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import NavDropdown from 'react-bootstrap/NavDropdown'
import Container from 'react-bootstrap/Container';
import { Routes,  Route, Link, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Home from './components/Home'
import Register from "./components/Register";
import Profile from "./components/Profile"
import Search from "./components/SearchFlights"
import CustomerSpendings from "./components/CustomerSpendings"
import BookedFlights from "./components/BookedFlights"
import AgentProfile from "./components/AgentCommissions"
import { Cookies, useCookies, withCookies } from 'react-cookie'
import { instanceOf } from 'prop-types'
import { Constants } from "./Utils"

class Bar extends React.Component {
    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };

  constructor(props) {
    super(props);

    this.state = { 
      user: this.props.allCookies['user'],
      type: this.props.allCookies['type'],
      loggedOut: this.props.allCookies['loggedOut'] ? this.props.allCookies['loggedOut'] : 'false'
    };

    if(this.props.allCookies['loggedOut'] !== undefined)
        this.props.cookies.remove('loggedOut');
    this.logout = this.logout.bind(this);
  }

  logout() {
    const { cookies } = this.props;
    cookies.remove('type');
    cookies.set('user', null);
    cookies.set('loggedOut', true)
  }

  render() {
    if(this.state.loggedOut === 'true')
      return <Navigate to={{pathname: '/login'}} />;

    const Log = () => {
        return(
          <Nav.Link as ={Link} to={"/login"}>Login/Register</Nav.Link>
        );
    } 

    const Menu = () => {
      return (
        <NavDropdown title={this.state.user.email} id="basic-nav-dropdown">
          <NavDropdown.Item as={Link} to={"/customer_spendings"} hidden={this.state.type.toString() !== Constants.CUSTOMER.toString()}>My spendings</NavDropdown.Item>
          <NavDropdown.Item as={Link} to={"/agent_profile"} hidden={this.state.type.toString() !== Constants.AGENT.toString()}>My profile</NavDropdown.Item>
          <NavDropdown.Item onMouseUp={this.logout}>Logout</NavDropdown.Item>
        </NavDropdown>
      );
    }

    return (
      <Container id="root">
        <Navbar id="navbar" className="ms-0 me-0" expand="lg" fixed="top">
          <Container>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link as={Link} to={"/"}>Home</Nav.Link>
                <NavDropdown title="Flights" id="basic-nav-dropdown">
                  <NavDropdown.Item as={Link} to={"/search_flights"}>Search flights</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to={"/booked_flights"} hidden={this.state.user === 'null'}>My flights</NavDropdown.Item>
                </NavDropdown>
              </Nav>
              <Nav className="justify-content-end">
                {
                  this.state.user === 'null' ? <Log /> : <Menu />
                }
              </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
          <Routes>
            <Route path='/login' caseSensitive={false} element={<Login updateNavbar={() => {this.login()}} />} />
            <Route path='/register' caseSensitive={false} element={<Register />} />
            <Route path='/profile' caseSensitive={false} element={<Profile />} />
            <Route path='/search_flights' caseSensitive={false} element={<Search />} />
            <Route path='/customer_spendings' caseSensitive={false} element={<CustomerSpendings />} />
            <Route path='/booked_flights' caseSensitive={false} element={<BookedFlights />} />
            <Route path='/agent_profile' caseSensitive={false} element={<AgentProfile />} />
            <Route path='/' caseSensitive={false} element={<Home />} />
          </Routes>
        </Container>
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
