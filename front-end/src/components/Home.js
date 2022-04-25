import "../css/Home.css"
import React from 'react';
import Container from 'react-bootstrap/Container'
import { Connection } from '../Utils'

class HomeClass extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Container id="test">

            </Container>
        );
    }
}

function Home() {
    return <HomeClass />;
}

export default Home;