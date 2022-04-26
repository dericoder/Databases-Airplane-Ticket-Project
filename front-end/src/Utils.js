class Constants {   
    static STATUS = 'status';

    static CUSTOMER = 1;
    static AGENT = 2;
    static STAFF = 3;

    // response constants
    static SUCCESS = 0;
    static FAILED = -1;
    static REASON = 'reason';

    // staff constants
    static STAFF_USERNAME = 'username';
    static STAFF_FNAME = 'first_name';
    static STAFF_LNAME = 'last_name';
    static STAFF_DOB = 'date_of_birth';
    static STAFF_WORKS = 'works_for';

    // customer constants
    static CUSTOMER_EMAIL = 'email';
    static CUSTOMER_PASSWORD = 'password';
    static CUSTOMER_NAME = 'name';
    static CUSTOMER_BUILDING = 'building_number';
    static CUSTOMER_STREET = 'street';
    static CUSTOMER_CITY = 'city';
    static CUSTOMER_STATE = 'state';
    static CUSTOMER_PHONE = 'phone_number';
    static CUSTOMER_PASSPORT = 'passport_number';
    static CUSTOMER_PASSPORT_EXPIRY = 'passport_expiry';
    static CUSTOMER_PASSPORT_COUNTRY = 'passport_country';
    static CUSTOMER_DOB = 'date_of_birth';

    // agent constants
    static AGENT_EMAIL = 'email';
    static AGENT_PASSWORD = 'password';
    static AGENT_ID = 'id';
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

class Customer {
    constructor(email, name, building_number, street, city, state, phone, passport, passport_expiry, passport_country, dob) {
        this.email = email;
        this.name = name;
        this.building_number = building_number;
        this.street = street;
        this.city = city;
        this.state = state;
        this.phone = phone;
        this.passport = passport;
        this.passport_expiry = passport_expiry;
        this.passport_country = passport_country;
        this.dob = dob;
    }
}

class Agent {
    constructor(email, id) {
        this.email = email;
        this.id = id;
    }
}

export {
    Constants,
    Staff,
    Customer,
    Agent
}