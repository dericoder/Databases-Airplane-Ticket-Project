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

import re
from this import d
from xml.dom.minidom import parseString
from flask import Flask, request, jsonify, session, redirect, url_for, send_file
from flask_cors import CORS
import pymysql.cursors
from datetime import date
from response import ErrorResponse, Response, Staff, Customer, Agent, Data
import matplotlib.pyplot as plt
from datetime import datetime
import numpy as np
import base64
from io import BytesIO

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

def escape(string):
    chars = ['\'', '\"', '\\']

    res = ""
    for c in string:
        if(c in chars):
            res += "\\" + c
        else:
            res += c
    
    return res

@app.route("/search")
def search():
    arrival = escape(request.args['arrival'])
    departure = escape(request.args['departure'])
    date = escape(request.args['date'])

    with cnx.cursor(pymysql.cursors.DictCursor) as cur:
        query = f"select * from flight where departure_airport='{departure}' and arrival_airport='{arrival}' and date(departure_time)='{date}'"
        cur.execute(query)
        rv = cur.fetchall()

        data = []
        for d in rv:
            new = Data()
            for k in d:
                new.addData(k, str(d[k]))

            arrival_dt = new.data['arrival_time']
            new.data['arrival_date'] = arrival_dt.split(" ")[0]
            new.data['arrival_time'] = arrival_dt.split(" ")[1]

            departure_dt = new.data['departure_time']
            new.data['departure_date'] = departure_dt.split(" ")[0]
            new.data['departure_time'] = departure_dt.split(" ")[1]
            data.append(new)

    return Response(0).addList('flights', data).json()

@app.route("/")
def foo():
    return "test"

@app.route("/airports")
def test():
    with cnx.cursor(pymysql.cursors.DictCursor) as cur:
            #look for upcoming flights that the customer has not bought yet
        query1 = "select flight.flight_num from flight left outer join (purchases natural join ticket) using (flight_num) where purchases.customer_email != 'one@nyu.edu' and flight.status = 'Upcoming'"
        cur.execute(query1)
        data = cur.fetchall()

    return str(len(data))

@app.route('/public')
def public():
    with cnx.cursor(pymysql.cursors.DictCursor) as cur:
        query = "select * from flight where status = \'Upcoming\'"
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
                    
                    with cnx.cursor() as cur:
                        cur.execute(ins)
                    cnx.commit()

                    return Response(0).json()
        except Exception as e:
            err = 'Registration failed!'
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
                                        data[Customer.PHONE], data[Customer.PASSPORT_NUMBER], data[Customer.PASSPORT_COUNTRY],
                                        data[Customer.PASSPORT_EXP],data[Customer.DOB])
                    session[data[Customer.EMAIL]] = customer.data
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
        with cnx.cursor(pymysql.cursors.DictCursor) as cur:
            query = 'select * from booking_agent where email = \'{}\''.format(user)
            cur.execute(query)
            data = cur.fetchone()

            if not data:
                return ErrorResponse('User not found').json()
            else:
                if data['password'] != password:
                    return ErrorResponse('Incorrect password').json()
                else:
                    agent = Agent(data[Agent.EMAIL], data[Agent.BOOKING_AGENT_ID])
                    return Response(0).addData(agent).json()


    return ErrorResponse('A server error occurred')

#CUSTOMER USE CASES
@app.route('/customer_viewmyflights', methods = ['GET','POST'])
def customer_viewmyflights():
    customer = request.args[Customer.EMAIL]

    with cnx.cursor(pymysql.cursors.DictCursor) as cur:    
        query = f"select distinct * from flight natural join purchases natural join ticket where purchases.customer_email = '{customer}' and flight.status = 'Upcoming'"
        cur.execute(query)
        rv = cur.fetchall()

        data = []
        for d in rv:
            new = Data()
            for k in d:
                new.addData(k, str(d[k]))

            arrival_dt = new.data['arrival_time']
            new.data['arrival_date'] = arrival_dt.split(" ")[0]
            new.data['arrival_time'] = arrival_dt.split(" ")[1]

            departure_dt = new.data['departure_time']
            new.data['departure_date'] = departure_dt.split(" ")[0]
            new.data['departure_time'] = departure_dt.split(" ")[1]
            data.append(new)

    return Response(0).addList('result', data).json()

@app.route('/customer_purchasetickets', methods = ['POST'])
def customer_purchaseflights():
    customer = request.args[Customer.EMAIL]
    airline_name = request.args.get('airline_name')
    flight_num = request.args.get('flight_num')

    with cnx.cursor(pymysql.cursors.DictCursor) as cur:
        findFlights = f"select * from ticket natural join purchases where flight_num={flight_num} and airline_name='{airline_name}'"
        cur.execute(findFlights)
        data = cur.fetchall()

        if(len(data) > 0):
            return ErrorResponse('A customer cannot buy the same ticket more than once').json()
        else:
            query2 = 'select max(ticket_id) as max from ticket'
            cur.execute(query2)
            ticket_id = cur.fetchone()
            if not ticket_id['max']: # no any ticket exists
                new_id = 1
            else:
                new_id = int(ticket_id['max']) + 1

            today = date.today()
            today = today.strftime("%Y-%m-%d")
        
            insertTicket = f'insert into ticket values ({new_id}, \'{airline_name}\', {flight_num})'
            cur.execute(insertTicket)
            insertPurchases = f'insert into purchases values ({new_id}, \'{customer}\', null, \'{today}\')'
            cur.execute(insertPurchases)

            cnx.commit()

            return Response(0).addData(Data("result", "Purchased ticket")).json()

@app.route('/customer_searchforflights', methods = ['GET', 'POST'])
def customer_searchforflights():
    arrival = escape(request.args['arrival'])
    departure = escape(request.args['departure'])
    date = escape(request.args['date'])

    if arrival == None and departure == None and date == None:
        with cnx.cursor(pymysql.cursors.DictCursor) as cur:
            query = "select * from flight where status = 'Upcoming'"
            cur.execute(query)
            data = cur.fetchall()
            return {'status':0, 'result': data}
    else:
        with cnx.cursor(pymysql.cursors.DictCursor) as cur:
            query = f"select * from flight where departure_airport=\"{departure}\" and arrival_airport=\"{arrival}\" and date(departure_time)=\'{date}\'"
            cur.execute(query)
            rv = cur.fetchall()

            data = []
            for d in rv:
                data.append(d)

        return Response(0).addData(Data('flights', data)).json()

@app.route('/customer_trackmyspending', methods = ['GET', 'POST'])
def customer_trackmyspending():
    email = request.args.get('email')
    start_year = int(request.args.get('start_year'))
    end_year = int(request.args.get('end_year'))
    start_month = int(request.args.get('start_month'))
    end_month = int(request.args.get('end_month'))

    if not start_month or not end_month or not start_year or not end_year:
        with cnx.cursor() as cur:
            query1 = f"select customer_email, sum(price) from purchases natural join ticket natural join flight where customer_email = '{email}' and purchase_date between date_sub(date(now()), interval 1 year) and date(now());"
            cur.execute(query1)
            data1 = cur.fetchone()
            if not data1:
                data1 = "0"
            else:
                data1 = data1[0]
            
            month = [0,1,2,3,4,5]
            monthly_spending = [0,0,0,0,0,0]

            query2 = "select year(date_sub(date(now()), interval {} month)) as year, month(date_sub(date(now()), interval {} month)) as month, sum(price) from ticket natural join purchases natural join flight where customer_email= \'{}\' AND year(purchase_date) = year(date_sub(date(now()), interval {} month)) and month(purchase_date)= month(date_sub(date(now()), interval {} month))"

            for i in range(6):
                with cnx.cursor() as cursor:
                    cursor.execute(query2.format(f"{month[i]}", f"{month[i]}", email, f"{month[i]}", f"{month[i]}"))
                    data2 = cursor.fetchone()
                    if data2[2]:
                        monthly_spending[i] = int(data2[2])

            currentMonth = int(datetime.now().month) - 1
            currentYear = int(datetime.now().year)
            months = ['January', 'February', 'March', 'April', 'May', 'June' ,'July', 'August', 'September', 'October', 'November', 'December']

            for i in range(len(month)):
                month[i] = str(months[currentMonth-month[i]]) + " " + str((currentYear if currentMonth - month[i] >= 0 else currentYear - 1))

            month = month[::-1]
            monthly_spending = monthly_spending[::-1]

            return Response(0).addData(Data('months', month)).addData(Data('spending', monthly_spending)).json()
    else:
        with cnx.cursor() as cur:

            query = f"select sum(flight.price) as spending, month(purchase_date) as month from purchases natural join ticket natural join flight where customer_email='{email}' and (purchase_date between date('{start_year}-{start_month}-01') and date('{end_year + 1 if end_month + 1 > 12 else end_year}-{end_month + 1 if end_month + 1 <= 12 else 1}-01')) group by month"

            months = ['January', 'February', 'March', 'April', 'May', 'June' ,'July', 'August', 'September', 'October', 'November', 'December']

            month = []
            monthly_spending = []
            
            cur.execute(query)

            rv = cur.fetchall()
            for i in rv:
                month.append(i[1])
                monthly_spending.append(i[0])

            previousMonth = month[0]
            for i in range(len(month)):
                year = start_year
                if(month[i] < previousMonth):
                    year += 1
                previousMonth = month[i]
                month[i] = str(months[month[i] - 1]) + " " + str(year)
                
            return Response(0).addData(Data('months', month)).addData(Data('spending', monthly_spending)).json()

@app.route('/customer_logout')
def customer_logout():
    customer_email = request.args[Customer.EMAIL]

    session.pop(customer_email)
    
    return "Goodbye!"

#BOOKING AGENT USE CASES

@app.route('/bookingagent_viewmyflights', methods = ['GET'])
def bookingagent_viewmyflights():
    agent_id = request.args[Agent.BOOKING_AGENT_ID]
    with cnx.cursor(pymysql.cursors.DictCursor) as cur:   
        query = f"select distinct * from flight natural join purchases natural join ticket where purchases.booking_agent_id = {agent_id} and flight.status = 'Upcoming'"
        cur.execute(query)
        rv = cur.fetchall()

        data = []
        for d in rv:
            new = Data()
            for k in d:
                new.addData(k, str(d[k]))

            arrival_dt = new.data['arrival_time']
            new.data['arrival_date'] = arrival_dt.split(" ")[0]
            new.data['arrival_time'] = arrival_dt.split(" ")[1]

            departure_dt = new.data['departure_time']
            new.data['departure_date'] = departure_dt.split(" ")[0]
            new.data['departure_time'] = departure_dt.split(" ")[1]
            data.append(new)

    return Response(0).addList('result', data).json()


@app.route('/bookingagent_purchasetickets', methods = ['GET', 'POST'])
def bookingagent_purchase():
    agent_email = request.args[Agent.EMAIL]

    if agent_email in session:
        with cnx.cursor() as curr:
            query = f"SELECT airline_name from booking_agent_work_for where email = '{Agent.EMAIL}'"
            curr.execute(query)
            dataa = curr.fetchone()
            airline_name = dataa[0]
            q = f"SELECT booking_agent_id from booking_agent where email = '{Agent.EMAIL}'"
            curr.execute(q)
            agent_id = curr.fetchone()
            booking_agent_id = agent_id[0]

        if request.method == 'POST':
            flight_num = request.args.get('flight_num')
            customer_email = request.args.get('customer_email')

            with cnx.cursor(pymysql.cursors.DictCursor) as cur:
                #look for upcoming flights that the customer has not bought yet
                query1 = f"select flight.flight_num from flight left outer join (purchases natural join ticket) using (flight_num) where purchases.customer_email != {customer_email} and flight.status = 'Upcoming'"
                cur.execute(query1)
                data = cur.fetchall()

                if not data:
                    return 'No flights available'
                else:
                    
                    for i in range(len(data)):
                        if data[i]['flight_num'] == flight_num:
                            with cnx.cursor() as cursor:
                                #check if the flight number is from the correct airline
                                check = f"select airline_name from flight where flight_num = '{flight_num}'"
                                cur.execute(check)
                                airline = cur.fetchall()
                                if airline[0][0] != airline_name:
                                    return {'status': -1, 'reason': 'Not from the same airline!'}
                                #look for the maximum number of ticket_id
                                query2 = 'select max(ticket_id) from ticket'
                                cursor.execute(query2)
                                ticket_id = cursor.fetchone()
                                if not ticket_id[0]: # no any ticket exists
                                    new_id = 1
                                else:
                                    new_id = int(ticket_id[0]) + 1
                                today = date.today()
                                today = today.strftime("%Y-%m-%d")
                                query3 = f'insert into purchases values ({new_id}, {customer_email}, {booking_agent_id}, {today})'
                                cur.execute(query3)
                                query4 = f'insert into ticket values ({new_id}, {airline_name}, {flight_num})'
                                cur.execute(query4)
                                cnx.commit()

                                return {'status': 0, 'result': 'Ticket purchase successful!'}
                        else:
                            continue
                        
                    return {'status': -1, 'reason': 'Ticket purchase unsuccessful!'}


@app.route('/bookingagent_searchforflights', methods = ['GET', 'POST'])
def bookingagent_searchforflights():
    criteria = request.args.get('criteria')
    value = request.args.get('value')
    staff_username = request.args[Staff.USERNAME]

    if staff_username in session:
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
            query1 = f"select * from flight where status = 'Upcoming' and {criteria} = '{value}'"
            cur.execute(query1)
            data = cur.fetchall()
            return {'status':0, 'result': data}


@app.route('/bookingagent_viewmycommission', methods = ['GET', 'POST'])
def bookingagent_viewmycommission():
    agent_email = request.args[Agent.EMAIL]

    start_date = None
    end_date = None

    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    if not start_date or not end_date:
        with cnx.cursor(pymysql.cursors.DictCursor) as cur:
            #assume commission is 10% of ticket price

            query = f"select sum(flight.price)*0.1 as total_commission, (sum(flight.price)*0.1)/count(ticket.flight_num) as average_commission, count(ticket.flight_num) as number_of_tickets from purchases natural join booking_agent natural join flight natural join ticket where booking_agent.email = '{agent_email}' and purchases.purchase_date >= adddate(date(now()), interval -30 day)"
            cur.execute(query)
            data = cur.fetchone()

            return {'status': 0, 'result': data}
    else:
        with cnx.cursor(pymysql.cursors.DictCursor) as cursor:
            query = f"select sum(flight.price)*0.1 as total_commission, (sum(flight.price)*0.1)/count(ticket.flight_num) as average_commission, count(ticket.flight_num) as number_of_tickets from purchases natural join booking_agent natural join flight natural join ticket where booking_agent.email = '{agent_email}' and purchases.purchase_date > '{start_date}' and purchases.purchase_date < '{end_date}'"
            cursor.execute(query)
            data = cursor.fetchone()

            return {'status': 0, 'result': data}



@app.route('/bookingagent_viewtopcustomers', methods = ['GET', 'POST'])
def bookingagent_viewtopcustomers():
    agent_email = request.args[Agent.EMAIL]
    with cnx.cursor(pymysql.cursors.DictCursor) as cur:
        query1 = f"select customer_email, count(*) as ticket_count from purchases natural join booking_agent where booking_agent.email = '{agent_email}' and purchases.purchase_date >= adddate(date(now()), interval -6 month) group by customer_email order by count(*) desc limit 5"
        cur.execute(query1)
        data_1 = cur.fetchall()

    top_customers_count = []
    customers_ticket_count = []

    for i in range(len(data_1)):
        cust_email = data_1[i]['customer_email']
        with cnx.cursor() as cursor:
            query_name = f"select name from customer where email = '{cust_email}'"
            cursor.execute(query_name)
            name = cursor.fetchone()
        top_customers_count.append(name[0])
        customers_ticket_count.append(data_1[i]['ticket_count'])
    

    top_customers_commission = []
    customers_commission = []

    with cnx.cursor(pymysql.cursors.DictCursor) as cursor:
        query2 = f"select customer_email, sum(flight.price)*0.1 as total_commission from purchases natural join booking_agent natural join flight natural join ticket where booking_agent.email = '{agent_email}' and purchases.purchase_date >= adddate(date(now()), interval -6 month) group by customer_email order by total_commission desc limit 5"
        cursor.execute(query2)
        data_2 = cursor.fetchall()

    for i in range(len(data_2)):
        cust_email = data_2[i]['customer_email']
        with cnx.cursor() as cursor:
            query_name = f"select name from customer where email = '{cust_email}'"
            cursor.execute(query_name)
            name = cursor.fetchone()
        top_customers_commission.append(name[0])
        customers_commission.append(data_2[i]['total_commission'])

    return Response(0).addData(Data('customers', top_customers_count)).addData(Data('tickets', customers_ticket_count)).addData(Data('commissions', customers_commission)).json()

@app.route('/bookingagent_logout')
def bookingagent_logout():
    agent_email = request.args[Agent.EMAIL]
    session.pop(agent_email)

    return "Goodbye!"



#airline staff use cases

@app.route('/staff_viewmyflights', methods = ['GET','POST'])
def staff_viewmyflights():
    staff_username = request.args[Staff.USERNAME]
    criteria = request.args['criteria']
    flight_number = request.args['flight_number']

    if staff_username in session:
        staff_airline = request.args[Staff.WORKS]

        with cnx.cursor(pymysql.cursors.DictCursor) as cur:
            if criteria == None:
                query = f"select * from flight where airline_name = '{staff_airline}' and (departure_time BETWEEN NOW() AND ADDTIME(NOW(), '30 0:0:0'))"
            else:
                query = f"select * from flight where airline_name = {staff_airline} and "
                for k in criteria.keys():
                    query += k + "='" + str(criteria[k]) + "' and"
                query = query[:-(len('and '))]

            cur.execute(query)
            data1 = cur.fetchall()

        if flight_number is not None:
            query = f"select customer_email, flight_num from purchases natural join ticket where flight_num ='{flight_number}'"
            with cnx.cursor(pymysql.cursors.DictCursor) as cur:
                cur.execute(query)
                data2 = cur.fetchall()

        return Response(0).addData(Data('result1', data1)).addData(Data('result2', data2)).json()




@app.route('/staff_createnewflights', methods = ['GET', 'POST'])
def staff_purchaseflights():
    staff_username = request.args[Staff.USERNAME]
    criteria = request.args['criteria']
    with cnx.cursor() as cur:
        query = f'select permission_type from permission where username = {staff_username}'
        cur.execute(query)
        permission = cur.fetchone()[0]

    if permission == 'Admin' or permission == 'Both': 
        with cnx.cursor() as cur:
            query2 = "SELECT airline_name FROM airline_staff WHERE username = '{}'".format(session['staff'])
            cur.execute(query2)
            airline_name = cur.fetchone()[0]

        try:
            crit_value = [None]*8
            for i in range(8):
                keys = list(criteria)
                crit_value[i] = criteria[keys[i]]

            query = f"insert into flight values('{airline_name}', '{crit_value[0]}', '{crit_value[1]}', '{crit_value[2]}', '{crit_value[3]}', '{crit_value[4]}', '{crit_value[5]}', '{crit_value[6]}', '{crit_value[7]}')"
        
            with cnx.cursor() as cur:
                cur.execute(query)
            cnx.commit()

            return 'Flight successfully created!'

        except Exception as e:
            err = 'Create new flights failed!'
            return ErrorResponse(err).json()
    else:
        return{'status': -1, 'reason': 'Permission not granted!'}


@app.route('/staff_changestatus', methods = ['GET', 'POST'])
def staff_changestatus():
    staff_username = request.args[Staff.USERNAME]

    if staff_username in session:
        staff_airline = request.args[Staff.WORKS]
        
        flight_num = request.args.get['flight_number']
        new_status = request.args.get['new_status']

        query = f"update flight set status = '{new_status}' where airline_name = '{staff_airline}' and flight_num = '{flight_num}'"

        with cnx.cursor() as cur:
            cur.execute(query)

        cnx.commit()

        return 'Flight status changed!'

    else:
        return {'status': -1, 'reason': 'Change Status failed!'}


@app.route('/staff_addairplane', methods = ['GET', 'POST'])
def staff_addairplane():
    staff_username = request.args[Staff.USERNAME]

    if staff_username in session:
        staff_airline = request.args[Staff.WORKS]

        airplane_id = request.args.get['new_airplane_id']
        seats = request.args.get['number_of_seats']

        try:
            query = f"insert into airplane values('{staff_airline}', '{airplane_id}', '{seats}')"
            
            with cnx.cursor() as cur:
                cur.execute(query)
            cnx.commit()

            return 'Airplane added!'

        except Exception as e:
            err = 'Add airplane failed!'
            return ErrorResponse(err).json()

    else:
        return ErrorResponse('Add airplane failed!').json()


@app.route('/staff_addairport', methods = ['GET', 'POST'])
def staff_addairport():
    staff_username = request.args[Staff.USERNAME]

    if staff_username in session:
        with cnx.cursor() as cur:
            query = f'select permission_type from permission where username = {staff_username}'
            cur.execute(query)
            permission = cur.fetchone()[0]

        if permission == 'Admin' or permission == 'Both': 
            airport_name = request.args.get('airport_name')
            airport_city = request.args.get('airport_city')
            try:
                query = f"insert into airport values('{airport_name}', '{airport_city}')"
                with cnx.cursor() as cur:
                    cur.execute(query)

                cnx.commit()

                return 'Airport added!'

            except Exception as e:
                err = 'Add airport failed!'
                return ErrorResponse(err).json()

        else:
            return ErrorResponse('Permission not granted').json()


@app.route('/staff_viewbookingagents', methods = ['GET', 'POST'])
def staff_viewbookingagents():
    staff_username = request.args[Staff.USERNAME]

    if staff_username in session:
        staff_airline = request.args[Staff.WORKS]

        with cnx.cursor(pymysql.cursors.DictCursor) as cur:
            #top booking agents based on number of tickets sales in the past month
            query = f"select booking_agent.email, count(ticket.ticket_id) as number_of_ticket_sales from booking_agent natural join ticket natural join purchases where airline_name = '{staff_airline}' and purchases.purchase_date >= adddate(date(now()), interval -1 month) group by booking_agent.email order by number_of_ticket_sales desc limit 5"
            cur.execute(query)
            data1 = cur.fetchall()
        
        with cnx.cursor(pymysql.cursors.DictCursor) as cursor:
            #top booking agents based on commission in the past year
            query2 = f"select booking_agent.email, 0.1*sum(flight.price) as commission from booking_agent natural join flight natural join ticket natural join purchases where airline_name = '{staff_airline}' and purchases.purchase_date >= adddate(date(now()), interval -12 month) group by booking_agent.email order by commission desc limit 5"
            cursor.execute(query)
            data2 = cur.fetchall()

        return Response(0).addData(Data('result1', data1)).addData(Data('result2', data2)).json()

    else:

        return ErrorResponse('Request Failed!')


@app.route('/staff_viewfrequentcustomers', methods = ['GET', 'POST'])
def staff_viewfrequentcustomers():
    staff_username = request.args[Staff.USERNAME]

    if staff_username in session:
        staff_airline = request.args[Staff.WORKS]

        with cnx.cursor(pymysql.cursors.DictCursor) as cur:
            #frequent customers in the past year
            query = f"select customer_email, count(ticket.ticket_id) as tickets_bought from purchases natural join ticket where airline_name = '{staff_airline}' and purchases.purchase_date >= adddate(date(now()), interval -12 month) group by customer_email order by tickets_bought desc limit 5"
            cur.execute(query)
            data1 = cur.fetchall()

        with cnx.cursor(pymysql.cursors.DictCursor) as cursor:
            #flights a particular customer has taken in the past year
            customer_email = request.args['customer_email']

            try:
                query = f"select flight.airline_name, flight.flight_num from purchases where customer_email = '{customer_email}' and flight.airline_name = '{staff_airline}' and purchases.purchase_date >= adddate(date(now()), interval -12 month)"
                cursor.execute(query)
                data2 = cursor.fetchall()

            except Exception as e:
                err = 'Customer not found!'
                return ErrorResponse(err).json()

        return Response(0).addData(Data('result1', data1)).addData(Data('result2', data2)).json()

    else:
        return ErrorResponse('Request Failed!').json()


@app.route('/staff_viewreport', methods = ['GET', 'POST'])
def staff_viewreport():
    staff_username = request.args[Staff.USERNAME]
    start_year = None
    end_year = None

    if staff_username in session:
        staff_airline = request.args[Staff.WORKS]
        start_year = int(request.args.get['start_year'])
        end_year = int(request.args.get['end_year'])
        start_month = int(request.args.get['start_month'])
        end_month = int(request.args.get['end_month'])

        if start_year == None and end_year == None:
            #default view is the past year
            with cnx.cursor() as cur:
                i = 0
                query = f"select year(date_sub(date(now()), interval {i} month)) as year, month(date_sub(date(now()), interval {i} month)) as month, count(*) as tickets_sold from purchases natural join flight where flight.airline_name = '{staff_airline}' and year(purchase_date) = year(date_sub(date(now()), interval {i} month)) and month(purchase_date) = month(date_sub(date(now()), interval {i} month))"
                months = [0,1,2,3,4,5,6,7,8,9,10,11,12]
                monthly_sales = []

                for month in months:
                    i = month
                    cur.execute(query)
                    data = cur.fetchone()
                    monthly_sales.append(int(data['tickets_sold']))
                    months[month] = str(data['month'])+'/'+str(data['year'])

                fig, (ax1) = plt.subplots(1,1, figsize=(7,7))
                ax1.bar(months, height=monthly_sales)
                ax1.set_title('Monthly ticket sales')
                ax1.set_xlabel('Month')
                ax1.set_ylabel('Number of Tickets sold')

            return {'status': 0, 'result': [months, monthly_sales]} 

        else:

            if start_year > end_year:
                return ErrorResponse('Start date has to be before end date!').json()
            if start_year == end_year:
                if start_month > end_month:
                    return ErrorResponse('Start date has to be before end date!').json()

            start_date = str(start_year) + '-' +str(start_month) + '/' + '01'
            end_date = str(end_year) + '-' +str(end_month) + '/' + '01'

            with cnx.cursor() as cursor:
                i = 0
                query = f"select year(date_sub(date('{start_date}')), interval {i} month) as year, month(date_sub(date('{start_date}')), interval {i} month) as month, count(*) as tickets_sold from purchases natural join flight where flight.airline_name = '{staff_airline}' and year(purchase_date) = year(date_sub(date('{start_date}')), interval {i} month) and month(purchase_date) = month(date_sub(date('{start_date}')), interval {i} month)"

                end_date = datetime.datetime(int(end_year),int(end_month),1)
                start_date = datetime.datetime(int(start_year), int(start_month), 1)

                num_months = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month)

                months = [i for i in range(num_months)]
                monthly_sales = []

                for month in months:
                    i = month
                    cursor.execute(query)
                    data = cur.fetchone()
                    monthly_sales.append(int(data['tickets_sold']))
                    months[month] = str(data['month'])+'/'+str(data['year'])

                fig, (ax1) = plt.subplots(1,1, figsize=(7,7))
                ax1.bar(months, height=monthly_sales)
                ax1.set_title('Monthly ticket sales')
                ax1.set_xlabel('Month')
                ax1.set_ylabel('Number of Tickets sold')

            return {'status': 0, 'result': [months, monthly_sales]} 
                

@app.route('/staff_comparerevenue', methods = ['GET', 'POST'])
def staff_comparerevenue():
    staff_username = request.args[Staff.USERNAME]

    if staff_username in session:
        staff_airline = request.args[Staff.WORKS]

        direct_last_month = 0
        indirect_last_month = 0

        query_customer_last_month = f"select sum(flight.price) as sales from flight natural join purchases natural join ticket where ticket.airline_name = '{staff_airline}' and purchases.booking_agent_id is null and purchase_date >= adddate(date(now()), interval -30 day)"
        query_agent_last_month = f"select sum(flight.price) as sales from flight natural join purchases natural join ticket where ticket.airline_name = '{staff_airline}' and purchases.booking_agent_id is not null and purchase_date >= adddate(date(now()), interval -30 day)"
        
        cur = cnx.cursor()
        cur.execute(query_customer_last_month)
        direct_last_month_sales = cur.fetchone()[0]
        direct_last_month = int(direct_last_month_sales)
        cur.close()

        cur = cnx.cursor()
        cur.execute(query_agent_last_month)
        indirect_last_month_sales = cur.fetchone()[0]
        indirect_last_month = int(indirect_last_month_sales)
        cur.close()

        direct_last_year = 0
        indirect_last_year = 0


        query_customer_last_year = f"select sum(flight.price) as sales from flight natural join purchases natural join ticket where ticket.airline_name = '{staff_airline}' and purchases.booking_agent_id is null and purchase_date >= adddate(date(now()), interval -12 month)"
        query_agent_last_year = f"select sum(flight.price) as sales from flight natural join purchases natural join ticket where ticket.airline_name = '{staff_airline}' and purchases.booking_agent_id is not null and purchase_date >= adddate(date(now()), interval -12 month)"
        

        cur = cnx.cursor()
        cur.execute(query_customer_last_year)
        direct_last_year_sales = cur.fetchone()[0]
        direct_last_year = int(direct_last_year_sales)
        cur.close()

        cur = cnx.cursor()
        cur.execute(query_agent_last_year)
        indirect_last_year_sales = cur.fetchone()[0]
        indirect_last_year = int(indirect_last_year_sales)
        cur.close()
        

        #create 2 pie charts

        fig = plt.figure(figsize=(10,4))

        ax1 = fig.add_subplot(121)
        ax2 = fig.add_subplot(122)

        last_month = np.array([direct_last_month, indirect_last_month])
        last_year = np.array([direct_last_year, indirect_last_year])

        last_month_label = [f'Without booking agent: ${direct_last_month}', f'With booking agent: ${indirect_last_month}']
        last_year_label = [f'Without booking agent: ${direct_last_year}', f'With booking agent: S{indirect_last_year}']
        ax1.pie(last_month, labels = last_month_label)
        ax2.pie(last_year, labels = last_year_label)

        ax1.set_title('Sales in the past month')
        ax2.set_title('Sales in the past year')

        return Response(0).addData(Data('past_month', last_month)).addData(Data('past_year', last_year)).json()


@app.route('/staff_viewtopdestinations', methods = ['GET', 'POST'])
def staff_viewtopdestinations():
    staff_username = request.args[Staff.USERNAME]

    if staff_username in session:
        staff_airline = request.args[Staff.WORKS]

        with cnx.cursor(pymysql.cursors.DictCursor) as cur:
            query = f"select arrival_airport from flight natural join purchases where flight.airline_name = '{staff_airline}' and purchase_date >= adddate(date(now()), interval -3 month) group by flight.arrival_airport order by count(*) desc"
            cur.execute(query)

            data1 = cur.fetchall()

        with cnx.cursor(pymysql.cursors.DictCursor) as cur:
            query = f"select arrival_airport from flight natural join purchases where flight.airline_name = '{staff_airline}' and purchase_date >= adddate(date(now()), interval -12 month) group by flight.arrival_airport order by count(*) desc"
            cur.execute(query)

            data2 = cur.fetchall()

        return Response(0).addData(Data('topdestinations_3months', data1)).addData(Data('topdestinations_1year', data2)).json()

    else:

        return ErrorResponse('Request Failed!').json()


@app.route('/staff_grantnewpermissions', methods = ['GET', 'POST'])
def staff_grantnewpermissions():
    staff_username = request.args[Staff.USERNAME]

    if staff_username in session:
        staff_airline = request.args[Staff.WORKS]
        with cnx.cursor() as cur:
            query = f"select permission_type from permission where username = '{staff_username}'"
            cur.execute(query)
            permission = cur.fetchone()[0]

        if permission == 'Admin' or permission == 'Both':
            other_username = request.args.get['staff_username']
            new_permission = request.args.get['new_permission']

            if new_permission in ['Admin', 'Operator', 'Both']:
                with cnx.cursor() as cur:
                        #check if other_username is in the same airline
                    q = f"select airline_name from airline_staff where username = '{other_username}'"
                    cur.execute(q)
                    other_airline = cur.fetchone()[0]
                    if other_airline != staff_airline:
                        return ErrorResponse('Staff is froma different airline. Permission not granted!').json()
                    
                    else:
                        query = f"update permission set permission_type = '{new_permission}' where username = '{other_username}'"
                        cur.execute(query)
                    
                    cnx.commit()
                    
                with cnx.cursor(pymysql.cursors.DictCursor) as cursor:
                    query = f"select username, permission_type from airline_staff natural join permission where airline_name = '{staff_airline}'"
                    cursor.execute(query)
                    data = cursor.fetchall()

                return {'status':0, 'updated list': data}.json()


            else:
                return ErrorResponse('Incorrect Permission!').json()


        else:
            
            return ErrorResponse('User not authorized!').json()


    else:
        return ErrorResponse('User not authorized!').json()



@app.route('/staff_addbookingagents', methods = ['GET', 'POST'])
def staff_addbookingagents():
    staff_username = request.args[Staff.USERNAME]

    if staff_username in session:
        staff_airline = request.args[Staff.WORKS]

        with cnx.cursor() as cur:
            query = f"select permission_type from permission where username = '{staff_username}'"
            cur.execute(query)
            permission = cur.fetchone()[0]

        with cnx.cursor(pymysql.cursors.DictCursor) as cursor:
            query = f"select email from booking_agent natural join booking_agent_work_for"
            cursor.execute(query)
            emails = cursor.fetchall()

        if permission == 'Admin' or permission == 'Both':
            agent_email = request.args['new_agent_email']
            if agent_email not in emails.values():
                return ErrorResponse('Bookign agent is not registered yet').json()
            
            else:

                try:
                    with cnx.cursor() as cur:
                        query = f"insert into booking_agent_work_for values ('{agent_email}','{staff_airline}')"
                        cur.execute(query)
                    cnx.commit()

                except Exception as e:
                    err = 'Agent cannot be added!'
                    return ErrorResponse(err).json()

        else:
            
            return ErrorResponse('User not authorized!').json()


@app.route('/staff_logout', methods = ['GET', 'POST'])
def staff_logout():
    customer_email = request.args[Customer.EMAIL]

    session.pop(customer_email)
    
    return "Goodbye!"
