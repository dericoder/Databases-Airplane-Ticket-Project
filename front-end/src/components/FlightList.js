import React from 'react'
import { Container, Row, Col, FloatingLabel as Label } from 'react-bootstrap'
import { Flight } from "../Utils"

class FlightList extends React.Component {
    render() {
        return (
            <Container className="mb-3 pt-3 pb-3" id="flightlist-container">
                <Container id="flightlist-info">
                    <Container id="flightlist-flight">
                        <Label style={{'font-size': '20px'}}>{this.props.info[Flight.AIRLINE]}</Label>
                        <Label style={{'font-size': '15px'}}>{this.props.info[Flight.AIRPLANE]}</Label>
                    </Container>
                    <Container id="flightlist-airports">
                        <Row>
                            <Col style={{'text-align': 'center'}}>
                                <Label>{this.props.info[Flight.DEPARTURE_TIME]}</Label>
                                <Label>{this.props.info[Flight.DEPARTURE_AIRPORT]}</Label>
                            </Col>
                            <Col style={{'text-align': 'center', 'justify-content': 'center'}}>
                                <Label>1h30min</Label>
                                <Label>{'\u2501\u2501\u2501\u2501\u2501\u2501'}</Label>
                            </Col>
                            <Col style={{'text-align': 'center'}}>
                                <Label>{this.props.info[Flight.ARRIVAL_TIME]}</Label>
                                <Label>{this.props.info[Flight.ARRIVAL_AIRPORT]}</Label>
                            </Col>
                        </Row>
                    </Container>
                </Container>
                <Container id="flightlist-price">
                    <Label>{'$' + this.props.info[Flight.PRICE]}</Label>
                    {this.props.children}
                </Container>
            </Container>
        );
    }
}

export default FlightList;