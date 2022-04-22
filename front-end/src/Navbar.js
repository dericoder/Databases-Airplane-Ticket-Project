import './Navbar.css'
import React from 'react';
import Button from 'react-bootstrap/Button'

class Navbar extends React.Component {
    render() {
        return (
            <div className="bar">
                <NavItem name="login"/>
            </div>
        );
    }
}

class NavItem extends React.Component {

    render() {
        return (
            <Button className="nav-item">{this.props.name}</Button>
        );
    }
}

export default Navbar;