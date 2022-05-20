import "../css/Airplanes.css"
import React from 'react'
import axios from 'axios'
import { withCookies } from 'react-cookie'
import { Container, Button, Table, Modal, Form } from 'react-bootstrap'
import { Constants } from "../Utils"
import Comp from './Comp'

/*
    TODO:
    1. validation when adding airplanes
*/
class AirplanesClass extends Comp {

    constructor(props) {
        super(props);

        this.state = {
            airplanes: []
        }

        this.addAirplane = this.addAirplane.bind(this);
        this.refreshTable = this.refreshTable.bind(this);
        this.addAirport = this.addAirport.bind(this);

        this.refreshTable();
    }

    addAirplane() {
        let permissions = this.props.allCookies.user.permissions;
        let isAdmin = false;
        for(let i = 0; i < permissions.length; i++) 
            if(permissions[i] === Constants.STAFF_ADMIN)
                isAdmin = true;

        if(!isAdmin)
            return;

        axios.post('http://localhost:5000/staff_addairplane', null, {
            params: {
                username: this.props.allCookies.user.username,
                airline_name: this.props.allCookies.user.works,
                new_airplane_id: this.state.airplane,
                number_of_seats: this.state.seats
            }
        }).then((res) => {
            this.setState({popupShow: false}, () => this.refreshTable())
        }).catch(() => {
            console.log("error")
        });
    }

    addAirport() {
        let permissions = this.props.allCookies.user.permissions;
        let isAdmin = false;
        for(let i = 0; i < permissions.length; i++) 
            if(permissions[i] === Constants.STAFF_ADMIN)
                isAdmin = true;

        if(!isAdmin)
            return;

        axios.post('http://localhost:5000/staff_addairport', null, {
            params: {
                username: this.props.allCookies.user.username,
                airport_city: this.state.airportCity,
                airport_name: this.state.airportName
            }
        }).then((res) => {
            console.log(res.data);
        }).catch(() => {
            console.log("error");
        })
    }

    refreshTable() {
        axios.get('http://localhost:5000/get_airplanes', {
            params: {
                airline_name: this.props.allCookies.user.works
            }
        }).then((res) => {
            let result = res.data;
            this.setState({airplanes: result['airplanes']});
        }).catch(() => {
            console.log("error")
        })
    }

    render() {
        return (
            <Container className="airplanesContainer">
                <Button onMouseUp={() => this.setState({popupShow: true})} style={{'width': '100%', 'marginBottom': '20px'}}>Add airplane</Button>
                <Button onMouseUp={() => this.setState({popupShowAirport: true})} style={{'width': '100%', 'marginBottom': '20px'}}>Add airport</Button>
                <Button onMouseUp={() => this.refreshTable()} style={{'width': '100%', 'marginBottom': '20px'}}>Refresh</Button>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Airplane ID</th>
                            <th>Number of seats </th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.state.airplanes.map((data) => {
                                return (
                                    <tr>
                                        <td>{data[1]}</td>
                                        <td>{data[2]}</td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </Table>
                <Modal
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={this.state.popupShow}
                    onHide={() => this.setState({popupShow: false})}
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Add airplane
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Label>Airplane ID</Form.Label>
                        <Form.Control className="mb-3" type="text" placeholder="Airplane ID" onChange={(e) => this.setState({airplane: e.target.value})} />
                        <Form.Label>Number of seats</Form.Label>
                        <Form.Control type="number" placeholder="Number of seats" onChange={(e) => this.setState({seats: e.target.value})} />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.addAirplane}>Add</Button>
                        <Button onClick={() => this.setState({popupShow: false})}>Close</Button>
                    </Modal.Footer>
                </Modal>
                <Modal
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={this.state.popupShowAirport}
                    onHide={() => this.setState({popupShowAirport: false})}
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Add airport
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>Airport city</Form.Label>
                            <Form.Control onChange={(e) => this.setState({airportCity: e.target.value})} placeholder="Airport city" />
                        </Form.Group>
                        <Form.Group className="mt-3">
                            <Form.Label>Airport name</Form.Label>
                            <Form.Control onChange={(e) => this.setState({airportName: e.target.value})} placeholder="Airport name" />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.addAirport}>Add</Button>
                        <Button onClick={() => this.setState({popupShowAirport: false})}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        );
    }
}

function Airplanes() {
    const AirplanesCookies = withCookies(AirplanesClass);
    return <AirplanesCookies />
}

export default Airplanes;