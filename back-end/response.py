from email.message import EmailMessage
from flask import jsonify

class Response:
    def __init__(self, status):
        self.data = {'status': status}

    def addData(self, data):
        if(data is list):
            for data in data:
                for k, v in data:
                    self.data[k] = v
        else:
            for k in data.data:
                self.data[k] = data.data[k]

        return self

    def addList(self, key, data):
        if(key not in self.data):
            self.data[key] = []

        if(data is list):
            for d in data:
                self.data[key].append(d.data)
        else:
            self.data[key].append(data.data)

        return self

    def json(self):
        return jsonify(self.data)

class Data:
    def __init__(self, k = None, v = None):
        if(k == None and v == None):
            self.data = {}
        else:
            self.data = {k: v}

    def addData(self, k, v):
        self.data[k] = v

    def json(self):
        return jsonify(self.data)

class ErrorResponse(Response):
    def __init__(self, value, code = -1):
        super().__init__(code)
        self.data['reason'] = value

class Staff(Data):

    USERNAME = 'username'
    PASSWORD = 'password'
    FNAME = 'first_name'
    LNAME = 'last_name'
    DOB = 'date_of_birth'
    WORKS = 'works_for'

    def __init__(self, username, fName, lName, dob, works):
        super().__init__()
        self.addData(Staff.USERNAME, username)
        self.addData(Staff.FNAME, fName)
        self.addData(Staff.LNAME, lName)
        self.addData(Staff.DOB, dob)
        self.addData(Staff.WORKS, works)

class Agent(Data):

    EMAIL = 'email'
    PASSWORD = 'password'
    BOOKING_AGENT_ID = 'booking_agent_id'

    def __init__(self, email, password, booking_agent_id):
        super().__init__()
        self.addData(Agent.EMAIL, email)
        self.addData(Agent.PASSWORD, password)
        self.addData(Agent.BOOKING_AGENT_ID, booking_agent_id)

class Customer(Data):
    
    EMAIL = 'email'
    NAME = 'name'
    PASSWORD = 'password'
    BUILDING_NUMBER = 'building_number'
    STREET = 'street'
    CITY ='city'
    STATE = 'state'
    PHONE = 'phone_number'
    PASSPORT_NUMBER = 'passport_number'
    PASSPORT_COUNTRY = 'passport_country'
    PASSPORT_EXP = 'passport_expiration'
    DOB = 'date_of_birth'

    def __init__(self, email, name, password, building_number, street, city, state, phone_number, passport_number, passport_country, passport_expiration, dob):
        super().__init__()
        self.addData(Customer.EMAIL, email)
        self.addData(Customer.NAME, name)
        self.addData(Customer.PASSWORD, password)
        self.addData(Customer.BUILDING_NUMBER, building_number)
        self.addData(Customer.STREET, street)
        self.addData(Customer.CITY, city)
        self.addData(Customer.STATE, state)
        self.addData(Customer.PHONE, phone_number)
        self.addData(Customer.PASSPORT_NUMBER, passport_number)
        self.addData(Customer.PASSPORT_COUNTRY, passport_country)
        self.addData(Customer.PASSPORT_EXP, passport_expiration)
        self.addData(Customer.DOB, dob)
