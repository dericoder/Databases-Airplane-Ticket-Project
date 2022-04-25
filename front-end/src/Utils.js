class Constants {   
    static STATUS = 'status';

    static CUSTOMER = 1;
    static AGENT = 2;
    static STAFF = 3;

    // response constants
    static SUCCESS = 0;
    static FAILED = -1;
    static REASON = 'reason';

    // customer constants
    static STAFF_USERNAME = 'username';
    static STAFF_FNAME = 'first_name';
    static STAFF_LNAME = 'last_name';
    static STAFF_DOB = 'date_of_birth';
    static STAFF_WORKS = 'works_for';
}

class Connection {
    // current connection
    static loggedIn = {
        status: false,
        user: null,
        type: null,
    };
}

class Staff {
    constructor(username, fName, lName, dob, works) {
        this.username = username;
        this.fName = fName;
        this.lName = lName;
        this.dob = dob;
        this.works = works;
    }
}

export {
    Constants,
    Connection,
    Staff
}