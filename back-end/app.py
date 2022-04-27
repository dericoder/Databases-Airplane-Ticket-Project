"""
successful queries
{
    status: 0,
    result: [
        {}, {}
    ]
}

failed queries
{
    status: -1,
    reason: ...
}
"""

from flask import Flask, request, jsonify, session, redirect, url_for
from flask_cors import CORS
import pymysql.cursors
from datetime import date
from response import ErrorResponse, Response, Staff, Customer, Agent, Data
import matplotlib.pyplot as plt

CUSTOMER = 1
AGENT = 2
STAFF = 3

app = Flask(__name__)
app.secret_key = 'a8jcd_a89.d9'
CORS(app)

cnx = pymysql.connect(host='localhost',
					port=3306,
					user='Admin',
                    password='Admin123.',
                    db='db_project')

@app.route("/search")
def search():
    if(request.args.get('type') == CUSTOMER):
        customer_search()

def customer_search():
    pass

@app.route("/")
def foo():
    return "test"

@app.route("/test")
def test():
    return "<h1>test</h1>"

@app.route('/public')
def public():
    with cnx.cursor(pymysql.cursors.DictCursor) as cur:
        query = "select * from flight where status = 'Upcoming'"
        cur.execute(query)
        data = cur.fetchall()

    return {'status': 0, 'result': data}

#REGISTER

@app.route("/register", methods = ["POST"])
def register():
    """
    
    """
    type = int(request.args['type'])
    if(type == CUSTOMER):

        email = request.args.get(Customer.EMAIL)
        name = request.args.get(Customer.NAME)
        password = request.args.get(Customer.PASSWORD)
        building_number = request.args.get(Customer.BUILDING_NUMBER)
        street = request.args.get(Customer.STREET)
        city = request.args.get(Customer.CITY)
        state = request.args.get(Customer.STATE)
        phone_number = request.args.get(Customer.PHONE)
        passport_number = request.args.get(Customer.PASSPORT_NUMBER)
        passport_country = request.args.get(Customer.PASSPORT_COUNTRY)
        passport_expiration = request.args.get(Customer.PASSPORT_EXP)
        date_of_birth = request.args.get(Customer.DOB)
        try:
            with cnx.cursor() as cur:
                query = 'select * from customer where email = \'{}\''.format(email)
                cur.execute(query)
                data = cur.fetchone()

                if data:
                    err = 'This user already exists!'
                    return ErrorResponse(err).json()
                else:
                    ins = 'insert into customer values (\'{}\', \'{}\', \'{}\', {}, \'{}\', \'{}\', \'{}\', {}, \'{}\', \'{}\', \'{}\', \'{}\')'.format(email, name, password, building_number, street, city, state, phone_number, passport_number, passport_expiration, passport_country, date_of_birth)
                    print(ins)
                    
                    with cnx.cursor() as cur:
                        cur.execute(ins)
                    cnx.commit()

                    return Response(0).json()
        except Exception as e:
            err = 'Registration failed!'
            print(e)
            return ErrorResponse(err).json()

    elif(type == STAFF):
        username = request.args.get(Staff.USERNAME)
        password = request.args.get(Staff.PASSWORD)
        first_name = request.args.get(Staff.FNAME)
        last_name = request.args.get(Staff.LNAME)
        date_of_birth = request.args.get(Staff.DOB)
        airline_name = request.args.get(Staff.WORKS)

        try:
            with cnx.cursor() as cur:
                query = 'select * from airline_staff where username = \'{}\''
                cur.execute(query)
                data = cur.fetchone()

                if data:
                    err = 'This user already exists!'
                    return ErrorResponse(err).json()
                else:
                    ins = 'insert into airline_staff values (\'{}\', \'{}\', \'{}\', \'{}\', \'{}\', \'{}\')'.format(username, password, first_name, last_name, date_of_birth, airline_name)
                    
                    with cnx.cursor() as cur:
                        cur.execute(ins)
                    cnx.commit()

                    return Response(0).json()

        except Exception as e:
            with cnx.cursor() as cur:
                checkAirline = 'select * from airline where name=\'{}\''.format(airline_name)
                cur.execute(checkAirline)
                data = cur.fetchone()

                if(data):
                    return ErrorResponse('Internal server error').json()
                else:
                    return ErrorResponse('Airline does not exist', -2).json()

    elif type == AGENT:
        email = request.args.get(Agent.EMAIL)
        password = request.args.get(Agent.PASSWORD)
        booking_agent_id = request.args.get(Agent.BOOKING_AGENT_ID)

        try:
            with cnx.cursor() as cur:
                query = 'select * from booking_agent where email = \'{}\''.format(email)
                cur.execute(query)
                data = cur.fetchone()

                if data:
                    err = 'This user already exists!'
                    return ErrorResponse(err).json()
                else:
                    ins = 'insert into booking_agent values (\'{}\', \'{}\', \'{}\')'.format(email, password, booking_agent_id)
                    
                    with cnx.cursor() as cur:
                        cur.execute(ins)
                    cnx.commit()

                    return Response(0).json()

        except Exception as e:
            err = 'Registration failed!'
            return ErrorResponse(err).json()

    return ErrorResponse('A server error occurred').json()

#LOGIN

@app.route("/login")
def login():
    user = request.args.get('user')
    password = request.args.get('password')
    type = int(request.args.get('type'))

    if type == CUSTOMER:
        with cnx.cursor(pymysql.cursors.DictCursor) as cur:
            query = 'select * from customer where email = \'{}\''.format(user)
            cur.execute(query)
            data = cur.fetchone()
            if not data:
                return ErrorResponse('User not found').json()
            else:
                if data['password'] != password:
                    return ErrorResponse('Incorrect password').json()
                else:
                    customer = Customer(data[Customer.EMAIL],data[Customer.NAME],data[Customer.BUILDING_NUMBER],
                                        data[Customer.STREET], data[Customer.CITY], data[Customer.STATE],
                                        data[Customer.PHONE], data[Customer.PASSPORT_NUMBER],
                                        data[Customer.PASSPORT_EXP],data[Customer.DOB])
                    session[data[Customer.EMAIL]] = Customer.data
                    return Response(0).addData(customer).json()

    elif type == STAFF:
        with cnx.cursor(pymysql.cursors.DictCursor) as cur:
            query = 'select * from airline_staff where username = \'{}\''.format(user)
            cur.execute(query)
            data = cur.fetchone()

            if not data:
                return ErrorResponse('User not found').json()
            else:
                if data[Staff.PASSWORD] != password:
                    return ErrorResponse('Incorrect password').json()
                else:
                    staff = Staff(data[Staff.USERNAME], data[Staff.FNAME], 
                                    data[Staff.LNAME], data[Staff.DOB], data[Staff.WORKS])
                    session[data[Staff.USERNAME]] = staff.data
                    return Response(0).addData(staff).json()

    elif type == AGENT:
        with cnx.cursor() as cur:
            query = 'select * from booking_agent where email = \'{}\''.format(user)
            cur.execute(query)
            data = cur.fetchone()

            if not data:
                return ErrorResponse('User not found').json()
            else:
                if data['password'] != password:
                    return ErrorResponse('Incorrect password').json()
                else:
                    staff = Agent(data[Agent.EMAIL], data[Agent.BOOKING_AGENT_ID])
                    session[data[Agent.EMAIL]] = Agent.data
                    return Response(0).addData(staff).json()


    return ErrorResponse('A server error occurred')


#CUSTOMER USE CASES
@app.route('/customer_viewmyflights', methods = ['GET','POST'])
def customer_viewmyflights():
    customer = session['customer']
    with cnx.cursor(pymysql.cursors.DictCursor) as cur:        
        query = "select distinct * from flight natural join purchases natural join ticket where purchases.customer_email = {customer} and flight.status = 'Upcoming'"
        cur.execute(query)
        data = cur.fetchall()
    result = str(data)
    return result

@app.route('/customer_purchasetickets', methods = ['GET', 'POST'])
def customer_purchaseflights():
    if request.method == 'POST':
        customer = session['customer']
        airline = request.args.get('airline')
        flight_num = request.args.get('flight_num')

        with cnx.cursor() as cur:
            #look for upcoming flights that the customer has not bought yet
            query1 = "select flight.flight_num, ticket.ticket_id from flight left outer join (purchases natural join ticket) using (flight_num) where purchases.customer_email != {customer} and flight.status = 'Upcoming'"
            cur.execute(query1)
            data = cur.fetchone()
            if not data:
                return 'No flights available'
            else:
                today = date.today()
                today = today.strftime("%Y-%m-%d")
                new_ticket_id = int(data[1]) + 1
                query2 = 'insert into purchases values ({new_ticket_id}, {customer}, null, {today})'
                cur.execute(query2)
                query3 = 'insert into ticket values ({new_ticket_id}, {airline}, {flight_num})'
                cur.execute(query3)
            cnx.commit()
            
        return 'Ticket purchase successful!'


@app.route('/customer_searchforflights', methods = ['GET', 'POST'])
def customer_searchforflights():
    criteria = request.args.get('criteria')
    value = request.args.get('value')
    if Staff.USERNAME in session:
        with cnx.cursor() as cur:
            query = "select permission_type from permission where username = '{}'".format(session['staff'])
            cur.execute(query)
            permission = cur.fetchone()
            permissions = permission[0]
    else:
        permissions = None

    if criteria == None:
        if permissions != None:
            with cnx.cursor(pymysql.cursors.DictCursor) as cur:
                query = "select * from flight"
                cur.execute(query)
                data = cur.fetchall()
                return {'status':0, 'result': data}
        else:       
            with cnx.cursor(pymysql.cursors.DictCursor) as cur:
                query = "select * from flight where status = 'Upcoming'"
                cur.execute(query)
                data = cur.fetchall()
                return {'status':0, 'result': data}
    else:
        with cnx.cursor(pymysql.cursors.DictCursor) as cur:
                query1 = "select * from flight where status = 'Upcoming' and {criteria} = '{value}'"
                cur.execute(query1)
                data = cur.fetchall()
                return {'status':0, 'result': data}

@app.route('/customer_trackmyspending', methods = ['GET', 'POST'])
def customer_trackmyspending():
    if Customer.EMAIL in session:
        name = request.args.get('name')
        start = request.args.get('start_month')
        end = request.args.get('end_month')

        if not start or not end:
            pass

        elif start > end:
            return ErrorResponse('Starting month cannot be later than ending month!').json()
        
        else:
            pass

