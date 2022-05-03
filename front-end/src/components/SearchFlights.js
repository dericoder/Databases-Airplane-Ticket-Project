import "../css/SearchFlights.css"
import React from 'react';
import { withCookies, Cookies } from 'react-cookie'
import { Container, Form, Button } from 'react-bootstrap'
import { instanceOf } from 'prop-types'
import { Airports } from '../Utils'
import { Typeahead } from 'react-bootstrap-typeahead'
import axios from "axios";

class SearchClass extends React.Component {

    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            arrivalValidated: true,
            departureValidated: true,
            dateValidated: true,
            arrival: "",
            departure: ""
        }

        this.validate = this.validate.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.search = this.search.bind(this);
    }

    onSubmit() {
        if(!this.validate()) {
            this.setState({error: true, errorMessage: "All fields must be filled"})
            return;
        }

        this.search();
    }

    search() {
    }

    validate() {
        let valid = true;

        let fields = {
            arrivalValidated: true,
            departureValidated: true,
            dateValidated: true
        }

        if(this.state.arrival === undefined || this.state.arrival === "") {
            fields.arrivalValidated = false;
            valid = false;
        }

        if(this.state.departure === undefined || this.state.departure === "") {
            fields.departureValidated = false;
            valid = false;
        }

        if(this.state.date === undefined || this.state.date === "") {
            fields.dateValidated = false;
            valid = false;
        }

        fields.arrivalValidated = Airports.has(this.state.arrival);
        fields.departureValidated = Airports.has(this.state.departure);

        this.setState(fields);

        return valid;
    }

    render() {
        return (
            <Container id="searchContainer">
                <Container id="form" className="pt-3 pb-3">
                    <Form.Group className="mb-3 airportfield">
                        <Form.Label>From</Form.Label>
                        <Typeahead 
                            id="arrival-field"
                            options={Airports.getAirportList()} 
                            placeholder="Airport"
                            onChange={(e) => {
                                if(e.length > 0)
                                    this.setState({departure: e[0].airport}) 
                            }}
                            onInputChange={(e) => this.setState({departure: e})} 
                            isInvalid={!this.state.departureValidated} />
                    </Form.Group>
                    <Form.Group className="mb-3 airportfield">
                        <Form.Label>To</Form.Label>
                        <Typeahead
                            id="departure-field"
                            options={Airports.getAirportList()} 
                            placeholder="Airport"
                            onChange={(e) => {
                                if(e.length > 0)
                                    this.setState({arrival: e[0].airport}) 
                            }}
                            onInputChange={(e) => this.setState({arrival: e})}
                            isInvalid={!this.state.arrivalValidated} />
                        <Form.Control.Feedback type="invalid">
                            Invalid airport
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3 datefield" >
                        <Form.Label>Departure Date</Form.Label>
                        <Form.Control type="date" onChange={(e) => {
                            this.setState({date: e.target.value});
                        }}
                        isInvalid={!this.state.dateValidated}/>
                        <Form.Control.Feedback>
                            Invalid date
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Button className="mb-3 mt-3" id="btnSubmit" onMouseUp={this.onSubmit}>
                        Search
                    </Button>
                </Container>
            </Container>
        )
    }
}

class AutoComplete extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            popupShown: false,
            selected: "",
            filteredOptions: props.options
        };
    }

    render() {
        return (
            <div>
                <Form.Control placeholder={this.props.placeholder} 
                              value={this.state.selected}
                              onChange={(e) => {
                                    this.setState({selected: e.target.value, filteredOptions: this.props.options.filter((data) => {return data.airport.toLowerCase().includes(e.target.value.toLowerCase()) || data.city.toLowerCase().includes(e.target.value.toLowerCase())}) })
                                    this.props.update(e.target.value);
                              }}
                              onFocus={() => this.setState({popupShown: true})} />
                <Container id="popup" hidden={!this.state.popupShown}>
                    {this.state.filteredOptions.map((data) => {
                        return <Button id="test" key={data.id}
                                       onMouseUp={() => {
                                            this.setState({selected: data.airport, popupShown: false})
                                            this.props.update(data.airport);
                                       }}>
                                    {data.city + " (" + data.airport + ")"}
                                </Button>;
                    })}
                </Container>
 
            </div>
        );
    }
}

function Search() {

    const SearchCookies = withCookies(SearchClass);

    return (
        <SearchCookies />
    );
}

export default Search;