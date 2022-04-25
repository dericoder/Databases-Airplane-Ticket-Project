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
from response import ErrorResponse, Response, Staff, Customer, Agent

CUSTOMER = 1
AGENT = 2
STAFF = 3

app = Flask(__name__)
CORS(app)

cnx = pymysql.connect(host='localhost',
					port=3306,
					user='root',
                    password='Root123.',
                    db='finalproject')

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

    result = str(data)
    return result

#REGISTER

@app.route("/register", methods = ["POST"])
def register():
    """
    
    """

    if request.args[0] == CUSTOMER:

        email = request.form.get('email')
        name = request.form.get('name')
        password = request.form.get('password')
        building_number = request.form.get('building_number')
        street = request.form.get('street')
        city = request.form.get('city')
        state = request.form.get('state')
        phone_number = request.form.get('phone_number')
        passport_number = request.form.get('passport_number')
        passport_expiration = request.form.get('passport_expiration')
        date_of_birth = request.form.get('date_of_birth')
        try:
            with cnx.cursor() as cur:
                query = 'select * from customer where email = {email}'
                cur.execute(query)
                data = cur.fetchone()

                if data:
                    err = 'This user already exists!'
                    return ErrorResponse(err).json()
                else:
                    ins = 'insert into customer values ({email}, {name}, {password}, {building_number}, {street}, {city}, {state}, {phone_number}, {passport_number}, {passport_expiration}, {date_of_birth})'
                    
                    with cnx.cursor() as cur:
                        cur.execute(ins)
                    cnx.commit()

                    return 'Registration Successful'
        except:
            err = 'Registration failed!'
            return ErrorResponse(err).json()


    elif request.args[0] == STAFF:
        username = request.form.get('username')
        password = request.form.get('password')
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')
        date_of_birth = request.form.get('date_of_birth')
        airline_name = request.form.get('airline_name')

        try:
            with cnx.cursor() as cur:
                query = 'select * from airline_staff where username = {username}'
                cur.execute(query)
                data = cur.fetchone()

                if data:
                    err = 'This user already exists!'
                    return ErrorResponse(err).json()
                else:
                    ins = 'insert into airline_staff values ({username}, {password}, {first_name}, {last_name}, {date_of_birth}, {airline_name})'
                    
                    with cnx.cursor() as cur:
                        cur.execute(ins)
                    cnx.commit()

                    return 'Registration Successful'
        except:
            err = 'Registration failed!'
            return ErrorResponse(err).json()


    elif request.args[0] == AGENT:
        email = request.form.get('email')
        password =request.form.get('password')
        booking_agent_id = request.form.get('booking_agent_id')

        try:
            with cnx.cursor() as cur:
                query = 'select * from booking_agent where email = {email}'
                cur.execute(query)
                data = cur.fetchone()

                if data:
                    err = 'This user already exists!'
                    return ErrorResponse(err).json()
                else:
                    ins = 'insert into booking_agent values ({email}, {password}, {booking_agent_id})'
                    
                    with cnx.cursor() as cur:
                        cur.execute(ins)
                    cnx.commit()

                    return 'Registration Successful'

        except:
            err = 'Registration failed!'
            return ErrorResponse(err).json()

    return {'status': -1, 'reason': 'Server error'}


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
                if data[1] != password:
                    return ErrorResponse('User not found').json()
                else:
                    session["customer"] = user
                    customer = Customer(data[0]['email'],data[0]['name'],data[0]['building_number'],
                                        data[0]['building_number'],data[0]['street'],
                                        data[0]['city'],data[0]['state'],data[0]['phone_number'], data[0]['passport_number'],
                                        data[0]['passport_expiration'],data[0]['date_of_birth'])
                    return Response(0).addData(customer).json()


    elif type == STAFF:
        with cnx.cursor() as cur:
            query = 'select * from airline_staff where username = \'{}\''.format(user)
            cur.execute(query)
            data = cur.fetchone()

            if not data:
                return ErrorResponse('User not found').json()
            else:
                if data[1] != password:
                    return ErrorResponse('Incorrect password').json()
                else:
                    session["staff"] = user
                    staff = Staff(data[0]['username'], data[0]['first_name'], data[0]['last_name'], data[0]['date_of_birth'], data[0]['works_for'])
                    return Response(0).addData(staff).json()


    elif type == AGENT:
        with cnx.cursor() as cur:
            query = 'select * from booking_agent where email = \'{}\''.format(user)
            cur.execute(query)
            data = cur.fetchone()

            if not data:
                return ErrorResponse('User not found').json()
            else:
                if data[1] != password:
                    return ErrorResponse('Incorrect password').json()
                else:
                    session["agent"] = user
                    staff = Agent(data[0]['email'], data[0]['booking_agent_id'])
                    return Response(0).addData(staff).json()


    return ErrorResponse('System error')


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
    customer = session['customer']
    with cnx.cursor() as cur:
        query1 = "select flight.flight_num and ticket.ticket_id from flight left outer join (purchases natural join ticket) using (flight_num) where purchases.customer_email = {customer} and flight.status = 'Upcoming'"
        cur.execute(query1)
        data = cur.fetchone()
        if not data:
            return 'No flights available'
        else:
            today = date.today()
            today = today.strftime("%Y-%m-%d")
            ticket_id = data[1] + 1
            query2 = 'insert into purchases values ({ticket_id}, {customer}, null, {today}'
            cur.execute(query2)
        cnx.commit()
        
    return 'Ticket purchase successful!'



@app.route('/customer_searchforflights', methods = ['GET', 'POST'])
def customer_searchforflights():
    return 'a'

if __name__ == '__main__':
    app.run()

