import "../css/AirlineStaff.css"
import React from 'react'
import axios from 'axios'
import { withCookies } from 'react-cookie'
import { Container, Form, ListGroup, ListGroupItem, FormControl, Button, Modal, DropdownButton } from 'react-bootstrap'
import { Constants } from "../Utils"
import DropdownItem from "react-bootstrap/esm/DropdownItem"

class AirlineStaffClass extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            staffs: [],
            staffPermissions: [],
            staff: "",
            titlePermission: "Permission",
        }

        this.searchStaff = this.searchStaff.bind(this);
        this.changePermission = this.changePermission.bind(this);
        this.getStaffPermissions = this.getStaffPermissions.bind(this);
    }

    searchStaff() {
        if(this.state.staff === "") {
            this.setState({staffs: []});
            return;
        }

        axios.get('http://localhost:5000/search_staff', {
            params: {
                username: this.state.staff
            }
        }).then((res) => {
            this.setState({staffs: res.data.staffs});
        }).catch(() => {
            console.log("error");
        })
    }

    changePermission() {
        let permissions = this.props.allCookies.user.permissions;
        let isAdmin = false;
        for(let i = 0; i < permissions.length; i++) 
            if(permissions[i] === Constants.STAFF_ADMIN)
                isAdmin = true;

        if(!isAdmin)
            return;

        axios.post('http://localhost:5000/staff_grantnewpermissions', null, {
            params: {
                username: this.props.allCookies.user.username,
                airline_name: this.props.allCookies.user.works,
                staff_username: this.state.selectedStaff,
                new_permission: this.state.titlePermission
            }
        }).then((res) => {
            console.log(res.data);
        }).catch(() => {
            console.log("error");
        })
    }

    getStaffPermissions(username) {
        if(this.state.titlePermission === "Permission")
            return;

        axios.get('http://localhost:5000/get_permission', {
            params: {
                username: username
            }
        }).then((res) => {
            this.setState({popupShow: true, staffPermissions: res.data.permissions});
        }).catch(() => {
            console.log("error");
        })
    }


    render() {
        return (
            <Container className="airlineStaffContainer">
                <Form className="d-flex mb-3">
                    <FormControl
                        type="search"
                        placeholder="Search staff username"
                        className="me-2"
                        aria-label="Search"
                        onChange={(e) => {
                            this.setState({staff: e.target.value})
                        }} />
                    <Button onMouseUp={this.searchStaff}>Search</Button>
                </Form>
                <ListGroup>
                    {
                        this.state.staffs.map((info) => {
                            return (
                                <ListGroupItem key={info.username} action onClick={() => this.setState({popupShow: true, selectedStaff: info.username})}>{info.username}</ListGroupItem>
                            );
                        })
                    }
                </ListGroup>
                <Modal
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={this.state.popupShow}
                    onHide={() => this.setState({popupShow: false})}
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Grant permission
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <DropdownButton title={this.state.titlePermission} onSelect={(e) => this.setState({titlePermission: e})}>
                            <DropdownItem eventKey={"Admin"}>Admin</DropdownItem>
                            <DropdownItem eventKey={"Operator"}>Operator</DropdownItem>
                        </DropdownButton>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => this.changePermission()}>Change</Button>
                        <Button onClick={() => this.setState({popupShow: false})}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        );
    }
}

function AirlineStaff() {
    const AirlineStaffCookies = withCookies(AirlineStaffClass);
    return <AirlineStaffCookies />
}

export default AirlineStaff;