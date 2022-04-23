from flask import Flask, request, jsonify, session, redirect, url_for
import pymysql.cursors
from forms import RegistrationForm

CUSTOMER = 1
AGENT = 2
STAFF = 3

app = Flask(__name__)

cnx = pymysql.connect(host='localhost',
					port=3306,
					user='root',
                    password='Root123.',
                    db='finalproject')

@app.route("/")
def foo():
    with cnx.cursor() as cur:
        query = "select * from airline"
        cur.execute(query)
        data = cur.fetchall()
    data = str(data[0][0])
    return data

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

@app.route("/login", methods = ["GET", "POST"])
def login():

    if request.args[0] == CUSTOMER:
        email = request.form.get('email')
        password = request.form.get('password')

        with cnx.cursor() as cur:
                query = 'select email, password from customer where email = {email}'
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


    elif request.args[0] == STAFF:
        username = request.form.get('username')
        password = request.form.get('password')

        with cnx.cursor() as cur:
                query = 'select username, password from airline_staff where email = {username}'
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

    elif request.args[0] == AGENT:
        email = request.form.get('email')
        password = request.form.get('password')

        with cnx.cursor() as cur:
                query = 'select email, password from booking_agent where email = {email}'
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


if __name__ == '__main__':
    app.run()