import '../css/CustomerSpendings.css'
import React from 'react'
import { withCookies, Cookies } from 'react-cookie'
import { instanceOf } from 'prop-types'
import { Container } from 'react-bootstrap'
import axios from 'axios'

class CustomerSpendingsClass extends React.Component {

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
        })
            .then((res) => {
                console.log(res);
            }).catch((err) => {
                console.log(err)
            });
    }

    render() {
        return (
            <Container className="spendingsContainer">

            </Container>
        );
    }
}

function CustomerSpendings() {
    const CustomerSpendingsCookie = withCookies(CustomerSpendingsClass);
    return <CustomerSpendingsCookie />;
}

export default CustomerSpendings;