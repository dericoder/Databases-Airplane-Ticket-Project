import '../css/CustomerSpendings.css'
import React from 'react'
import { withCookies, Cookies } from 'react-cookie'
import { instanceOf } from 'prop-types'
import { Button, Container, Form } from 'react-bootstrap'
import axios from 'axios'
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
import Comp from './Comp'

class CustomerSpendingsClass extends Comp {

    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            user: this.props.allCookies['user']
        }

        axios.get('http://localhost:5000/customer_trackmyspending', {
            params: {
                email: this.state.user.email,
                start_year: 0,
                end_year: 0,
                start_month: 0,
                end_month: 0
            }
        }).then((res) => {
            let response = res.data;

            this.setState({
                months: response['months'],
                spending: response['spending']
            });
        }).catch((err) => {
            console.log(err)
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
        if(this.state.endYear < this.state.startYear) {
            this.setState({error: true, errorMessage: 'End year is earlier than starting year'});
        } else if(this.state.endYear === this.state.startYear) {
            if(this.state.endMonth < this.state.startMonth) {
                this.setState({error: true, errorMessage: 'End month is earlier than starting month'});
            }
        }

        let diff = (this.state.endYear - this.state.startYear) * 12 + (this.state.endMonth - this.state.startMonth)

        if(diff > 12)
            this.setState({error: true, errorMessage: ''});

        axios.get('http://localhost:5000/customer_trackmyspending', {
            params: {
                email: this.state.user.email,
                start_year: this.state.startYear,
                start_month: this.state.startMonth,
                end_year: this.state.endYear,
                end_month: this.state.endMonth
            }
        }).then((res) => {
            let response = res.data;

            if(res.data.status === -2) {
                this.setState({
                    months: [],
                    spending: []
                })
            } else {
                this.setState({
                    months: response['months'],
                    spending: response['spending']
                });
            }

        }).catch((err) => {
            this.setState({error: true, errorMessage: 'Server error'});
        });
    }

    render() {
        const d = {
            labels: this.state.months,
            datasets: [{
            label: 'Spendings',
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: this.state.spending,
            }]
        };

        return (
            <Container className="spendingsContainer">
                <Bar 
                    options={{responsive: true}}
                    data={d}
                    className="mb-5"
                />
                <Container className="mb-3 dateContainer">
                    <Form.Group className="me-3">
                        <Form.Label>From</Form.Label>
                        <Form.Control type="month" id="monthYearPicker" onChange={(e) => {
                            let dateArr = e.target.value.split("-");
                            this.setState({startYear: parseInt(dateArr[0]), startMonth: parseInt(dateArr[1])});
                        }} />
                    </Form.Group>

                    <Form.Group className="ms-3 me-3">
                        <Form.Label>To</Form.Label>
                        <Form.Control type="month" id="monthYearPicker" onChange={(e) => {
                            let dateArr = e.target.value.split("-");
                            this.setState({endYear: parseInt(dateArr[0]), endMonth: parseInt(dateArr[1])});
                        }} />
                    </Form.Group>

                    <Button className="ms-3 filterButton" onMouseUp={this.filter}>
                        Filter
                    </Button>
                </Container>
            </Container>
        );
    }
}

function CustomerSpendings() {
    const CustomerSpendingsCookie = withCookies(CustomerSpendingsClass);
    return <CustomerSpendingsCookie />;
}

export default CustomerSpendings;