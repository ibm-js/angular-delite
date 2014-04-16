#from flask import Flask
#from flask.ext import restful
#import json

#app = Flask(__name__)
#api = restful.Api(app)

#class HelloWorld(restful.Resource):
    #def get(self):
        #return {'hello': 'world'}

#def saveDataToFile(file_name, data):
	#with open(file_name, "w") as data_file:
		#data = json.load(data_file)
		#return data(data, data_file, indent=4)


#def getDataFromFile(file_name):
	#with open(file_name, "r") as data_file:
		#data = json.load(data_file)
		#return data

#BOOKS = getDataFromFile("data.json")

#class Book(restful.Resource):

	#def get(self, book_id):
		#if book_id == "all":
			#return BOOKS
		#else:
			#id = int(book_id)
			#if id < len(BOOKS):
				#return BOOKS[id]
			#else:
				#return {}

	#def put(self, book_id):
		#id = int(book_id)
		#if id < len(BOOKS):
			##BOOKS[id]
			#print request.json

	#def options (self, book_id):
		#others = { 
				#"Access-Control-Allow-Headers": "X-Requested-With", 
				#'Access-Control-Allow-Origin': '*', 
				#'Access-Control-Allow-Methods' : 'PUT,GET'
		#}
		#return {'Allow' : 'PUT,GET' }, 200, others
		##return {'Allow' : 'PUT,GET' }, 200, { "Access-Control-Allow-Headers": "ORIGIN, X-REQUESTED-WITH, CONTENT-TYPE, ACCEPT", 'Access-Control-Allow-Origin': 'http://localhost:8080', 'Access-Control-Allow-Methods' : 'PUT,GET' }

#api.add_resource(HelloWorld, '/')
#api.add_resource(Book, '/books/<string:book_id>')

#if __name__ == '__main__':
    #app.run(debug=True)


from flask import Flask

import json, pprint
from datetime import timedelta
from flask import make_response, request, current_app
from functools import update_wrapper

from datetime import timedelta
from flask import make_response, request, current_app
from functools import update_wrapper


def crossdomain(origin=None, methods=None, headers=None,
				max_age=21600, attach_to_all=True,
				automatic_options=True):
	if methods is not None:
		methods = ', '.join(sorted(x.upper() for x in methods))
	if headers is not None and not isinstance(headers, basestring):
		headers = ', '.join(x.upper() for x in headers)
	if not isinstance(origin, basestring):
		origin = ', '.join(origin)
	if isinstance(max_age, timedelta):
		max_age = max_age.total_seconds()

	def get_methods():
		if methods is not None:
			return methods

		options_resp = current_app.make_default_options_response()
		return options_resp.headers['allow']

	def decorator(f):
		def wrapped_function(*args, **kwargs):
			if automatic_options and request.method == 'OPTIONS':
				resp = current_app.make_default_options_response()
			else:
				resp = make_response(f(*args, **kwargs))
			if not attach_to_all and request.method != 'OPTIONS':
				return resp

			h = resp.headers

			h['Access-Control-Allow-Origin'] = origin
			h['Access-Control-Allow-Methods'] = get_methods()
			h['Access-Control-Max-Age'] = str(max_age)
			if headers is not None:
				h['Access-Control-Allow-Headers'] = headers
			return resp

		f.provide_automatic_options = False
		return update_wrapper(wrapped_function, f)
	return decorator

# helpers
def pluck(inObj, props):
	outObj = {}
	for p in props:
		outObj[p] = inObj[p]
	return outObj


app = Flask(__name__)

@app.route('/')
def hello_world():
	return 'Hello World!'

@app.route('/books/<bookId>', methods=['GET', 'OPTIONS'])
@crossdomain(origin='http://localhost:8080', headers="origin, x-requested-with, content-type, accept")
def get(bookId):
	with open("data.json") as dataFile:
		books = json.load(dataFile)
		if bookId != "all":
			book = filter(lambda i : i["id"] == bookId, books)
			return json.dumps(book, indent=4)
		else:
			titles = map(lambda b : pluck(b, ["title", "id", "rating"]), books)
			return json.dumps(titles, indent=4)

@app.route('/books/<bookId>', methods=['PUT'])
@crossdomain(origin='http://localhost:8080', headers="origin, x-requested-with, content-type, accept")
def put(bookId):
	with open("data.json", "r") as dataFile:		
		books = json.load(dataFile)
		book = filter(lambda i : i["id"] == bookId, books)
		if len(book) > 0:
			for i, b in enumerate(books):
				if b["id"] == bookId:
					books[i] = request.json
					print "changed", i, books[i]
		else:
			books.append(request.json)

	with open("data.json", "w") as dataFile:
		json.dump(books, dataFile, indent=4)
	return "success"

if __name__ == '__main__':
	app.run(debug=True)
