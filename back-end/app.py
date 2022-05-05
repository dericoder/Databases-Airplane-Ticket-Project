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
    arrival = request.args['arrival']
    departure = request.args['departure']
    date = request.args['date']

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
                    session[data[Agent.EMAIL]] = agent.data
                    return Response(0).addData(agent).json()


    return ErrorResponse('A server error occurred')

#CUSTOMER USE CASES
@app.route('/customer_viewmyflights', methods = ['GET','POST'])
def customer_viewmyflights():
    customer = request.args[Customer.EMAIL]
    criteria = None
    value = None

    if request.method =='POST':
        criteria = request.args.get('criteria')
        value = request.args.get('value')

    with cnx.cursor(pymysql.cursors.DictCursor) as cur:    
        if criteria == None and value == None:    
            query = f"select distinct * from flight natural join purchases natural join ticket where purchases.customer_email = {customer} and flight.status = 'Upcoming'"
            cur.execute(query)
            data = cur.fetchall()
        else:
            query = f"select distinct * from flight natural join purchases natural join ticket where purchases.customer_email = {customer} and flight.status = 'Upcoming' and flight.{criteria} = '{value}'"
            cur.execute(query)
            data = cur.fetchall()

    return {'status':0, 'result': data}

@app.route('/customer_purchasetickets', methods = ['GET', 'POST'])
def customer_purchaseflights():
    customer = request.args[Customer.EMAIL]
    if request.method == 'POST':
        airline_name = request.args.get('airline_name')
        flight_num = request.args.get('flight_num')

        with cnx.cursor(pymysql.cursors.DictCursor) as cur:
            #look for upcoming flights that the customer has not bought yet
            query1 = "select flight.flight_num from flight left outer join (purchases natural join ticket) using (flight_num) where purchases.customer_email != {customer} and flight.status = 'Upcoming'"
            cur.execute(query1)
            data = cur.fetchall()
            
            if not data:
                return 'No flights available'
            else:
                for i in range(len(data)):
                    if data[i]['flight_num'] == flight_num:
                        with cnx.cursor() as cursor:
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
                            query3 = f'insert into purchases values ({new_id}, {customer}, null, {today})'
                            cur.execute(query3)
                            query4 = f'insert into ticket values ({new_id}, {airline_name}, {flight_num})'
                            cur.execute(query4)
                            cnx.commit()

                            return 'Ticket purchase successful!'
                    else:
                        continue
                    
                return 'Ticket purchase unsuccessful!'

                    

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
            query1 = f"select * from flight where status = 'Upcoming' and {criteria} = '{value}'"
            cur.execute(query1)
            data = cur.fetchall()
            return {'status':0, 'result': data}

@app.route('/customer_trackmyspending', methods = ['GET', 'POST'])
def customer_trackmyspending():
    customer_email = request.args[Customer.EMAIL]

    if customer_email in session:
        email = request.args.get('email')
        start_year = int(request.args.get('start_year'))
        end_year = int(request.args.get('end_year'))
        start_month = int(request.args.get('start_month'))
        end_month = int(request.args.get('end_month'))

        if not start_month or not end_month:
            with cnx.cursor() as cur:
                query1 = f"select customer_email, sum(price) from purchases natural join ticket natural join flight where customer_email = {email} and purchase_date between date_sub(date(now()), interval 1 year) and date(now());"
                cur.execute(query1)
                data1 = cur.fetchone()
                if not data1:
                    data1 = "0"
                else:
                    data1 = data1[0]
                
                month = [1,2,3,4,5,6]
                monthly_spending = [0,0,0,0,0,0]

                query2 = "select year(date_sub(date(now()), interval {} month)) as year, month(date_sub(date(now()), interval {} month)) as month, sum(price) from ticket natural join purchases natural join flight where customer_email= {} AND year(purchase_date) = year(date_sub(date(now()), interval {} month)) and month(purchase_date)= month(date_sub(date(now()), interval {} month))"
                
                for i in range(6):
                    with cnx.cursor() as cursor:
                        cursor.execute(query2.format(f"{month[i]}", f"{month[i]}", email, f"{month[i]}", f"{month[i]}"))
                        data2 = cursor.fetchone()
                        if data2[2]:
                            monthly_spending[i] = int(data2[2])
                fig, (ax1) = plt.subplots(1,1, figsize=(7,7))
                ax1.bar(month, height=monthly_spending)
                ax1.set_title(f'Monthly spending of {email}')
                ax1.set_xlabel('Month')
                ax1.set_ylabel('Spending')
                
                return {'status': 0, 'result': [data1, month, monthly_spending]}


        elif start_month > end_month or start_year > end_year:
            return ErrorResponse('Starting month cannot be later than ending month!').json()
        
        else:
            with cnx.cursor() as cur:
                query1 = f"select customer_email, sum(price) from purchases natural join ticket natural join flight where customer_email = {email} and purchase_date between date('{start_year}-0{start_month}-01') and date('{end_year}-0{end_month}-01');"
                cur.execute(query1)
                data1 = cur.fetchone()
                if not data1:
                    data1 = "0"
                else:
                    data1 = data1[0]

                month = []
                monthly_spending = []
                
                interval = end_month-start_month
                for i in range(interval):
                    month.append(interval+1)

                k = 0
                query2 = f"select sum(price) from ticket natural join purchases natural join flight where customer_email= {email} AND year(purchase_date) = year(date('{start_year}-0{start_month+k}-01')) and month(purchase_date)= month(date('{end_year}-0{end_month+k}-01'))"

                for i in range(interval):
                    with cnx.cursor() as cursor:
                        cursor.execute(query2)
                        data2 = cursor.fetchone()
                        k += 1 
                        if data2[0]:
                            monthly_spending[i] = int(data2[0])
                fig, (ax1) = plt.subplots(1,1, figsize=(7,7))
                ax1.bar(month, height=monthly_spending)
                ax1.set_title(f'Monthly spending of {email}')
                ax1.set_xlabel('Month')
                ax1.set_ylabel('Spending')
                    
                return {'status': 0, 'result': [month, monthly_spending]}

@app.route('/customer_logout')
def customer_logout():
    customer_email = request.args[Customer.EMAIL]

    session.pop(customer_email)
    
    return "Goodbye!"

#BOOKING AGENT USE CASES

@app.route('/bookingagent_viewmyflights', methods = ['GET','POST'])
def bookingagent_viewmyflights():
    agent_id = session[Agent.BOOKING_AGENT_ID]
    criteria = None
    value = None
    if request.method =='POST':
        criteria = request.args.get('criteria')
        value = request.args.get('value')

    with cnx.cursor(pymysql.cursors.DictCursor) as cur:   
        if criteria != None and value!= None:
            query = f"select distinct * from flight natural join purchases natural join ticket where purchases.booking_agent_id = {agent_id} and flight.status = 'Upcoming' and flight.{criteria} = '{value}'"
            cur.execute(query)
            data = cur.fetchall()
        else:
            query = f"select distinct * from flight natural join purchases natural join ticket where purchases.booking_agent_id = {agent_id} and flight.status = 'Upcoming'"
            cur.execute(query)
            data = cur.fetchall()

    return {'status':0, 'result': data}


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

    if agent_email in session:
        start_date = None
        end_date = None

        if request.method == 'POST':
            start_date = request.args.get('start_date')
            end_date = request.args.get('end_date')
        else:
            pass

        if start_date == None and end_date == None:
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
    if agent_email in session:
        with cnx.cursor(pymysql.cursors.DictCursor) as cur:
            query1 = f"select customer_email, count(*) as ticket_count from purchases natural join booking_agent where booking_agent.email = {agent_email} and purchases.purchase_date >= adddate(date(now()), interval -6 month) group by customer_email order by count(*) desc limit 5"
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

        
        return {'status': 0, 'result': [top_customers_count, customers_ticket_count, top_customers_commission, customers_commission]}


@app.route('/bookingagent_logout')
def bookingagent_logout():
    agent_email = request.args[Agent.EMAIL]
    session.pop(agent_email)

    return "Goodbye!"
