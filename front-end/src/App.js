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
import Airplanes from "./components/Airplanes"
import AgentProfile from "./components/AgentCommissions"
import AirlineReport from "./components/AirlineReport"
import { Cookies, useCookies, withCookies } from 'react-cookie'
import { instanceOf } from 'prop-types'
import { Constants } from "./Utils"
import AddFlights from "./components/AddFlights"
import { Offcanvas } from "react-bootstrap"
import AirlineAgent from "./components/AirlineAgent"
import AirlineCustomer from "./components/AirlineCustomer"
import AirlineStaff from "./components/AirlineStaff"

class Bar extends React.Component {
    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };

  constructor(props) {
    super(props);

    this.state = { 
      user: this.props.allCookies['user'],
      type: this.props.allCookies['type'],
      loggedOut: this.props.allCookies['loggedOut'] ? this.props.allCookies['loggedOut'] : 'false',
      showAirlineMenu: false
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
    if(this.state.navigateTo !== undefined)
      return <Navigate to={{pathname: this.state.navigateTo}} />;

    if(this.state.loggedOut === 'true')
      return <Navigate to={{pathname: '/login'}} />;

    const Log = () => {
        return(
          <Nav.Link as ={Link} to={"/login"}>Login/Register</Nav.Link>
        );
    } 

    const Menu = () => {
      return (
        <NavDropdown title={this.state.user.email === undefined ? this.state.user.username : this.state.user.email} id="basic-nav-dropdown">
          <NavDropdown.Item as={Link} to={"/customer_spendings"} hidden={this.state.type.toString() !== Constants.CUSTOMER.toString()}>My spendings</NavDropdown.Item>
          <NavDropdown.Item as={Link} to={"/agent_profile"} hidden={this.state.type.toString() !== Constants.AGENT.toString()}>My profile</NavDropdown.Item>
          <NavDropdown.Item onMouseUp={this.logout}>Logout</NavDropdown.Item>
        </NavDropdown>
      );
    }

    const AirlineMenuItem = (props) => {
      return (
        <Nav.Link as={Link} to={props.to} onMouseUp={() => {
        }} style={{'color': 'black'}}>{props.children}</Nav.Link>
      );
    }

    return (
      <Container id="root">
        <Navbar id="navbar" className="ms-0 me-0" fixed="top">
          <Container>
            <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-lg`} />
              <Navbar.Offcanvas scroll={true} backdrop={false} style={{'width': '200px'}} show={this.state.showAirlineMenu} onHide={() => this.setState({showAirlineMenu: false})} className="me-2">
                <Offcanvas.Header closeButton>
                  <Offcanvas.Title>
                    Airline menu
                  </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                  <Nav className="justify-content-end flex-grow-1 pe-3">
                    <AirlineMenuItem to={"/airline_agent"}>Booking agents</AirlineMenuItem>
                    <AirlineMenuItem to={"/airplanes"}>Airplanes</AirlineMenuItem>
                    <AirlineMenuItem to={"/airline_customer"}>Customer</AirlineMenuItem>
                    <AirlineMenuItem to={"/airline_report"}>View report</AirlineMenuItem>
                    <AirlineMenuItem to={"/airline_staffs"}>Staffs</AirlineMenuItem>
                  </Nav>
                </Offcanvas.Body>
              </Navbar.Offcanvas>
              <Nav className="me-auto">
                <Navbar.Brand onMouseUp={() => this.setState({showAirlineMenu: true})} style={{'cursor': 'pointer'}}>{this.props.allCookies.type === Constants.STAFF.toString() ? this.props.allCookies.user.works : "Traveloqa"}</Navbar.Brand>
                <Nav.Link as={Link} to={"/"}>Home</Nav.Link>
                <NavDropdown title="Flights" id="basic-nav-dropdown">
                  <NavDropdown.Item as={Link} to={"/search_flights"}>Search flights</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to={"/booked_flights"} hidden={this.state.user === 'null' || this.state.type === Constants.STAFF.toString()}>My flights</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to={"/add_flight"} hidden={this.state.type !== Constants.STAFF.toString()}>Add flight</NavDropdown.Item>
                </NavDropdown>
              </Nav>
              <Nav className="justify-content-end">
                {
                  this.state.user === 'null' ? <Log /> : <Menu />
                }
              </Nav>
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
            <Route path='/add_flight' caseSensitive={false} element={<AddFlights />} />
            <Route path='/airplanes' caseSensitive={false} element={<Airplanes />} />
            <Route path='/airline_agent' caseSensitive={false} element={<AirlineAgent />} />
            <Route path='/airline_report' caseSensitive={false} element={<AirlineReport />} />
            <Route path='/airline_customer' caseSensitive={false} element={<AirlineCustomer />} />
            <Route path='/airline_staffs' caseSensitive={false} element={<AirlineStaff />} />
            <Route path='/' caseSensitive={false} element={<Home />} />
          </Routes>
        </Container>
    );
  }
}

function App() {
  const [cookies, setCookie] = useCookies(['cookie']);

  if(cookies['user'] === undefined)
    setCookie('user', null);
  const NavBar = withCookies(Bar);

  return (
    <NavBar />
  );
}

export default withCookies(App);
