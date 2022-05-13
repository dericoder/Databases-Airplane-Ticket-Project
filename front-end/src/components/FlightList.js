import "../css/FlightList.css"
import React from 'react'
import { Container, Row, Col, FloatingLabel as Label } from 'react-bootstrap'
import { Flight } from "../Utils"

class FlightList extends React.Component {
    render() {
        return (
            <Container className="mb-3 pt-3 pb-3 flightlistContainer" onMouseUp={this.props.onMouseUp === undefined ? null : this.props.onMouseUp}
                                                                      onMouseDown={this.props.onMouseDown === undefined ? null : this.props.onMouseDown}>
                <Container id="flightlist-info">
                    <Container id="flightlist-flight">
                        <Label style={{'fontSize': '20px'}}>{this.props.info[Flight.AIRLINE]}</Label>
                        <Label style={{'fontSize': '15px'}}>{this.props.info[Flight.NUMBER]}</Label>
                    </Container>
                    <Container id="flightlist-airports">
                        <Row>
                            <Col style={{'textAlign': 'center'}}>
                                <Label>{this.props.info[Flight.DEPARTURE_TIME]}</Label>
                                <Label>{this.props.info[Flight.DEPARTURE_AIRPORT]}</Label>
                            </Col>
                            <Col style={{'textAlign': 'center', 'justifyContent': 'center'}}>
                                <Label>1h30min</Label>
                                <Label>{'\u2501\u2501\u2501\u2501\u2501\u2501'}</Label>
                            </Col>
                            <Col style={{'textAlign': 'center'}}>
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