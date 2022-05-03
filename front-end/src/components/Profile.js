import "../css/Profile.css"
import React from 'react'
import { withCookies, Cookies } from 'react-cookie'
import { instanceOf } from 'prop-types'
import { Button, Container, FloatingLabel as Label } from 'react-bootstrap'

class ProfileClass extends React.Component {

    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            type: this.props.allCookies['type'],
            user: this.props.allCookies['user']
        }
    }

    render() {
        return(
            <div>

            </div>
        );
    }
}

function Profile() {
    const ProfileCookies = withCookies(ProfileClass);
    return <ProfileCookies />;
}

export default Profile;