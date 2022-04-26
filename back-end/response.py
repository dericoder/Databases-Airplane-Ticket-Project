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
    def __init__(self, email, password, booking_agent_id):
        super().__init__()
        self.addData('email', email)
        self.addData('password', password)
        self.addData('booking_agent_id', booking_agent_id)

class Customer(Data):

    def __init__(self, email, name, password, building_number, street, city, state, phone_number, passport_number, passport_expiration, dob):
        super().__init__()
        self.addData('email', email)
        self.addData('name', name)
        self.addData('password', password)
        self.addData('building_number', building_number)
        self.addData('street', street)
        self.addData('city', city)
        self.addData('state', state)
        self.addData('phone_number', phone_number)
        self.addData('passport_number', passport_number)
        self.addData('passport_expiration', passport_expiration)
        self.addData('date_of_birth', dob)
