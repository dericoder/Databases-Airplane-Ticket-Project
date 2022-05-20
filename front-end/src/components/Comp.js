import React from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

class Comp extends React.Component {
    constructor(props) {
        super(props);

        this.state = { 
            user: this.props.allCookies['user'],
            loggedOut: this.props.allCookies['loggedOut'] ? this.props.allCookies['loggedOut'] : 'false',
        };

        if(this.props.allCookies['user'] !== 'null')
            axios.get('http://localhost:5000/session', {
                params: {
                    user: this.props.allCookies.user.email === undefined ? this.props.allCookies.user.username : this.props.allCookies.user.email,
                    time: new Date().getTime()
                }
            }).then((res) => {
                if(res.data.status === -1) {
                    alert("You will be logged out due to inactivity");
                    this.logout();
                }

            }).catch((err) => {
                console.log(err);
            });
    }

    logout() {
        const { cookies } = this.props;
        cookies.remove('type');
        cookies.remove('date');
        cookies.remove('time');
        cookies.set('user', null);
        cookies.set('loggedOut', true)

        axios.get('http://localhost:5000/logout', {
            params: {
                user: this.props.allCookies.user.email === undefined ? this.props.allCookies.user.username : this.props.allCookies.user.email,
            }
        })
    }

    render() {
        if(this.state.loggedOut === 'true')
            return <Navigate to={{pathname: '/login'}} />;
    }
}

export default Comp;