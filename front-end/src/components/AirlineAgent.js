import "../css/AirlineAgent.css"
import React from 'react'
import axios from 'axios'
import { Container,  Table, Button, Modal, Form } from 'react-bootstrap'
import { withCookies } from 'react-cookie'
import { Constants } from "../Utils"

class AirlineAgentClass extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            ticketSales: [],
            commissions: [],
            popupShow: false
        }

        axios.get('http://localhost:5000/staff_viewbookingagents', {
            params: {
                username: this.props.allCookies.user.username,
                airline_name: this.props.allCookies.user.works
            }
        }).then((res) => {
            let result = res.data;
            this.setState({commissions: result.commissions, ticketSales: result.ticketSales})
        }).catch(() => {
            console.log("error")
        });

        this.addAgent = this.addAgent.bind(this);
    }

    addAgent() {
        let permissions = this.props.allCookies.user.permissions
        let isAdmin = false;
        for(let i = 0; i < permissions.length; i++)
            if(permissions[i] === Constants.STAFF_ADMIN)
                isAdmin = true;

        if(!isAdmin)
            return;    

        axios.post('http://localhost:5000/staff_addbookingagents', null, {
            params: {
                username: this.props.allCookies.user.username,
                airline_name: this.props.allCookies.user.works,
                new_agent_email: this.state.agentEmail
            }
        }).then((res) => {
            console.log(res.data);
        }).catch(() => {
            console.log("error");
        });
    }

    render() {
        let ti = -1;
        let ci = -1;

        return (
            <Container className="airlineAgentContainer">
                <Table striped bordered hover>
                    <thead>
                        <tr>
                        <th>Booking agent email</th>
                        <th>Ticket sales</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.state.ticketSales.map((info) => {
                                ti += 1;
                                return (
                                    <tr key={ti}>
                                        <td>{info.email}</td>
                                        <td>{info.number_of_ticket_sales}</td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </Table>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Booking agent email</th>
                            <th>Commission</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.state.commissions.map((info) => {
                                ci += 1;
                                return (
                                    <tr key={ci}>
                                        <td>{info.email}</td>
                                        <td>${info.commission}</td>
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
                            Insert customer email
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Label>Booking agent email</Form.Label>
                        <Form.Control type="text" placeholder="Booking agent email" onChange={(e) => this.setState({agentEmail: e.target.value})} />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.addAgent}>Add</Button>
                        <Button onClick={() => this.setState({popupShow: false})}>Close</Button>
                    </Modal.Footer>
                </Modal>
                <Button onMouseUp={() => this.setState({popupShow: true})} style={{'width': '100%'}}>Add booking agent</Button>
            </Container>
        );
    }
}

function AirlineAgent() {
    const AirlineAgentCookies = withCookies(AirlineAgentClass);
    return <AirlineAgentCookies />
}

export default AirlineAgent;