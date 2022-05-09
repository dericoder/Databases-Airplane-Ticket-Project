import "../css/AirlineReport.css"
import React from 'react'
import axios from 'axios'
import { withCookies } from 'react-cookie'
import { Container, Form, Button, Tab, Tabs, FloatingLabel as Label } from 'react-bootstrap'
import { Bar, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

class AirlineReportClass extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            ticketSoldMonths: [],
            ticketSoldValues: [],
            topYear: [],
            topMonth: [],
            start_year: 0,
            start_month: 0,
            end_year: 0,
            end_month: 0,
            currentTab: "tickets"
        }

        ChartJS.register(
            CategoryScale,
            LinearScale,
            BarElement,
            Title,
            Tooltip,
            ArcElement,
            Legend
        );

        this.findTicketSold = this.findTicketSold.bind(this);
        this.findRevenue = this.findRevenue.bind(this);
            
        this.findTicketSold();
    }

    findRevenue() {
        axios.get('http://localhost:5000/staff_comparerevenue', {
            params: {
                airline_name: this.props.allCookies.user.works,
                username: this.props.allCookies.user.username
            }
        }).then((res) => {
            let result = res.data;
            this.setState({directYear: result['direct_last_year'], directMonth: result['direct_last_month'], indirectYear: result['indirect_last_year'], indirectMonth: result['indirect_last_month']});
        }).catch(() => {
            console.log("error");
        })
    }

    findTicketSold() {
        axios.get('http://localhost:5000/staff_viewreport', {
            params: {
                username: this.props.allCookies.user.username,
                airline_name: this.props.allCookies.user.works,
                start_year: this.state.start_year,
                start_month: this.state.start_month,
                end_year: this.state.end_year,
                end_month: this.state.end_month
            }

        }).then((res) => {
            this.setState({ticketSoldMonths: res.data.result[0], ticketSoldValues: res.data.result[1]});

            axios.get('http://localhost:5000/staff_viewtopdestinations', {
                params: {
                    username: this.props.allCookies.user.username,
                    airline_name: this.props.allCookies.user.works
                }
            }).then((res) => {
                console.log(res.data);
                this.setState({topMonth: res.data['topdestinations_3months'], topYear: res.data['topdestinations_1year']});
            })
        }).catch(() => {
            console.log('error');
        })

    }

    render() {
        const ticketSold = {
            labels: this.state.ticketSoldMonths,
            datasets: [{
            label: 'Ticket Sold',
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: this.state.ticketSoldValues,
            }]
        };

        const salesLabel = ["Direct sales", "Indirect sales"];
        
        console.log(this.state.directMonth)

        const lastMonthData = {
            labels: salesLabel,
            datasets: [
                {
                    label: 'Sales',
                    data: [this.state.directMonth, this.state.indirectMonth],
                    backgroundColor: [
                        'rgb(255, 99, 132)',
                        'rgb(132, 99, 255)'
                    ],
                    borderColor: [
                        'rgb(255, 99, 132)',
                        'rgb(132, 99, 255)'
                    ]
                },
            ]
        };

        const lastYearData = {
            labels: salesLabel,
            datasets: [
                {
                    label: 'Sales',
                    data: [this.state.directYear, this.state.indirectYear],
                    backgroundColor: [
                        'rgb(255, 99, 132)',
                        'rgb(132, 99, 255)'
                    ],
                    borderColor: [
                        'rgb(255, 99, 132)',
                        'rgb(132, 99, 255)'
                    ]
                },
            ]
        };

        return (
            <Container className="airlineReportContainer">
                <Tabs onSelect={(k) => {
                    this.setState({currentTab: k}, () => {
                        if(k === "tickets")
                            this.findTicketSold();
                        else if(k === "revenue")
                            this.findRevenue();
                    });
                }} id="uncontrolled-tab-example" className="mb-3">
                    <Tab eventKey="tickets" title="Tickets">
                        <Container className="mb-3" style={{'textAlign': 'center'}}>
                        <h1>Top 3 destinations last 3 month</h1>
                        {
                            this.state.topMonth.map((info) => {
                                return (
                                    <Label style={{'fontSize': '30px'}}>{info.arrival_airport}</Label>
                                );
                            })
                        }
                        <h1>Top 3 destinations last year</h1>
                        {
                            this.state.topYear.map((info) => {
                                return (
                                    <Label style={{'fontSize': '30px'}}>{info.arrival_airport}</Label>
                                );
                            })
                        }
                        </Container>
                        <Bar 
                            options={{responsive: true}}
                            data={ticketSold}
                            className="mb-5"
                        />
                        <Container className="mb-3 dateContainer">
                            <Form.Group className="me-3">
                                <Form.Label>From</Form.Label>
                                <Form.Control type="month" id="monthYearPicker" onChange={(e) => {
                                    let dateArr = e.target.value.split("-");
                                    this.setState({start_year: parseInt(dateArr[0]), start_month: parseInt(dateArr[1])});
                                }} />
                            </Form.Group>

                            <Form.Group className="ms-3 me-3">
                                <Form.Label>To</Form.Label>
                                <Form.Control type="month" id="monthYearPicker" onChange={(e) => {
                                    let dateArr = e.target.value.split("-");
                                    this.setState({end_year: parseInt(dateArr[0]), end_month: parseInt(dateArr[1])});
                                }} />
                            </Form.Group>

                            <Button className="ms-3 filterButton" onMouseUp={this.findTicketSold}>
                                Filter
                            </Button>
                        </Container>
                    </Tab>
                    <Tab eventKey="revenue" title="Revenue">
                        <Container style={{'width': '400px', 'height': '400px', 'text-align': 'center'}}>
                            <h1>last year</h1>
                            <Pie data={lastYearData} />
                            <h1>last month</h1>
                            <Pie data={lastMonthData} />
                        </Container>
                    </Tab>
                </Tabs>
            </Container>
        );
    }
}

function AirlineReport() {
    const AirlineReportCookies = withCookies(AirlineReportClass);
    return <AirlineReportCookies />
}

export default AirlineReport;