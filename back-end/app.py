from flask import Flask
from flask import request
from flask import jsonify
import pymysql.cursors

app = Flask(__name__)

cnx = pymysql.connect(host='localhost',
					port=3306,
					user='root',
                    password='Root123.',
                    db='University')

@app.route("/")
def foo():
    with cnx.cursor() as cur:
        query = "select * from course"
        cur.execute(query)
        data = cur.fetchall()
    data = str(data)
    return data

@app.route("/test")
def test():
    return "<h1>test</h1>"

if __name__ == '__main__':
    app.run()