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

class ErrorResponse(Response):
    def __init__(self, value):
        super().__init__(-1)
        self.data['reason'] = value

class Staff(Data):
    def __init__(self, username, fName, lName, dob, works):
        super().__init__()
        self.addData('username', username)
        self.addData('first_name', fName)
        self.addData('last_name', lName)
        self.addData('date_of_birth', dob)
        self.addData('works_for', works)