import "../css/AgentCommissions.css"
import React from 'react'
import axios from 'axios'
import { Container, FloatingLabel as Label, Form, Button } from "react-bootstrap"
import { withCookies } from 'react-cookie'
import { Constants } from "../Utils"
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

/*
    TODO:
    1. Average and Total decimal places
    2. Formatting
    3. per tickets bug
 */
class AgentProfileClass extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            user: this.props.allCookies['user'],
            startDate: 0,
            endDate: 0,
            total: 0,
            avg: 0,
            num_tickets: 0
        }

        axios.get('http://localhost:5000/bookingagent_viewmycommission', {
            params: {
                email: this.state.user[Constants.AGENT_EMAIL]
            }
        }).then((res) => {
            let result = res.data['result'];
            this.setState({total: result['total_commission'], avg: result['average_commission'], tickets: result['number_of_tickets']});

            axios.get('http://localhost:5000/bookingagent_viewtopcustomers', {
                params: {
                    email: this.state.user[Constants.AGENT_EMAIL]
                }
            }).then((res) => {
                result = res.data
                console.log(result['customers'])
                console.log(result['tickets'])
                console.log(result['commissions'])
                this.setState({customers: result['customers'], tickets: result['tickets'], commissions: result['commissions']});
            }).catch(() => {
                console.log("Server error");
            });

        }).catch(() => {
            console.log("Server error");
        });

        ChartJS.register(
            CategoryScale,
            LinearScale,
            BarElement,
            Title,
            Tooltip,
            Legend
        );


        this.filter = this.filter.bind(this);
    }

    filter() {
        axios.get('http://localhost:5000/bookingagent_viewmycommission', {
            params: {
                email: this.state.user[Constants.AGENT_EMAIL],
                start_date: this.state.startDate.toString(),
                end_date: this.state.endDate.toString()
            }
        }).then((res) => {
            let result = res.data['result']
            this.setState({total: result['total_commission'], avg: result['average_commission'], num_tickets: result['number_of_tickets']});
        }).catch(() => {
            console.log("Error")
        })
    }
        
    render() {
        const commissionsData = {
            labels: this.state.customers,
            datasets: [{
                label: 'Commissions',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: this.state.commissions,
            }]
        };

        const ticketsData = {
            labels: this.state.customers,
            datasets: [{
                label: 'Tickets',
                backgroundColor: 'rgb(99, 132, 255',
                borderColor: 'rgb(99, 132, 255',
                data: this.state.tickets
            }]
        }

        return (
            <Container className="agentProfileContainer">
                <Container>
                    <h1>Top 5 customers</h1>
                    <hr></hr>
                    <Bar 
                        options={{responsive: true}}
                        data={commissionsData}
                        className="mb-5"
                    />
                    <Bar 
                        options={{responsive: true}}
                        data={ticketsData}
                        className="mb-5"
                    />
                </Container>
                <Container className="mb-5">
                    <Label style={{'fontSize': '50px', 'width': '100%', 'textAlign': 'center'}}>Total Commissions</Label>
                    <Label style={{'fontSize': '50px', 'width': '100%', 'textAlign': 'center'}}>${this.state.total}</Label>
                    <Label style={{'fontSize': '50px', 'width': '100%', 'textAlign': 'center'}}>Average Commissions per {this.state.num_tickets} tickets</Label>
                    <Label style={{'fontSize': '50px', 'width': '100%', 'textAlign': 'center'}}>${this.state.avg}</Label>

                    <Container className="mb-3 mt-3 dateContainer">
                        <Container className="monthYearContainer">
                            <Form.Group className="me-3">
                                <Form.Label>From</Form.Label>
                                <Form.Control type="date" className="monthYearPicker" onChange={(e) => {
                                    this.setState({startDate: e.target.value})
                                }} />
                            </Form.Group>

                            <Form.Group className="ms-3 me-3">
                                <Form.Label>To</Form.Label>
                                <Form.Control type="date" className="monthYearPicker" onChange={(e) => {
                                    this.setState({endDate: e.target.value})
                                }} />
                            </Form.Group>
                        </Container>
                        <Button className="mt-2 filterButton" onMouseUp={this.filter}>
                            Filter
                        </Button>
                    </Container>
                </Container>
            </Container>
        );
    }
}

function AgentProfile() {
    const AgentProfileCookie = withCookies(AgentProfileClass);
    return <AgentProfileCookie />
}

export default AgentProfile;