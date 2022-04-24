"""
successful queries
{
    status: 0,
    result: [
        {...},
        {...}
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

CUSTOMER = 1
AGENT = 2
STAFF = 3

app = Flask(__name__)
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
                    error = 'This user already exists!'
                    return error
                else:
                    ins = 'insert into customer values ({email}, {name}, {password}, {building_number}, {street}, {city}, {state}, {phone_number}, {passport_number}, {passport_expiration}, {date_of_birth})'
                    
                    with cnx.cursor() as cur:
                        cur.execute(ins)
                    cnx.commit()

                    return 'Registration Success'
        except:
            error = 'Registration failed!'
            return error


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
                    error = 'This user already exists!'
                    return error
                else:
                    ins = 'insert into airline_staff values ({username}, {password}, {first_name}, {last_name}, {date_of_birth}, {airline_name})'
                    
                    with cnx.cursor() as cur:
                        cur.execute(ins)
                    cnx.commit()

                    return 'Registration Success'
        except:
            error = 'Registration failed!'
            return error


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
                    error = 'This user already exists!'
                    return error
                else:
                    ins = 'insert into booking_agent values ({email}, {password}, {booking_agent_id})'
                    
                    with cnx.cursor() as cur:
                        cur.execute(ins)
                    cnx.commit()

                    return 'Registration Success'

        except:
            error = 'Registration failed!'
            return error



#LOGIN

@app.route("/login")
def login():
    user = request.args.get('user')
    password = request.args.get('password')
    type = int(request.args.get('type'))

    if type == CUSTOMER:
        with cnx.cursor() as cur:
            query = 'select email, password from customer where email = \'{}\''.format(user)
            cur.execute(query)
            data = cur.fetchone()
            if not data:
                error = 'User not found'
                return error
            else:
                if data[1] != password:
                    error = 'Incorrect Password'
                    return error
                else:
                    return 'Login Success'


    elif type == STAFF:
        print ("looking for staff")
        with cnx.cursor() as cur:
            query = 'select username, password from airline_staff where username = \'{}\''.format(user)
            print(query)
            cur.execute(query)
            data = cur.fetchone()

            if not data:
                error = 'User not found'
                return error
            else:
                if data[1] != password:
                    error = 'Incorrect Password'
                    return error
                else:
                    return 'Login Success'

    elif type == AGENT:
        with cnx.cursor() as cur:
            query = 'select email, password from booking_agent where email = \'{}\''.format(user)
            cur.execute(query)
            data = cur.fetchone()

            if not data:
                error = 'User not found'
                return error
            else:
                if data[1] != password:
                    error = 'Incorrect Password'
                    return error
                else:
                    return 'Login Success'

    return {'status': -1, 'reason': 'Server error'}
    
