from flask import Flask,jsonify,request,send_file
from flask_cors import CORS
from flask_pymongo import PyMongo
import boto3

app = Flask(__name__)
CORS(app)
CORS(app, resources={r"/search/*": {"origins": "http://localhost:3000"}})
app.config["MONGO_URI"] = "mongodb://localhost:27017/new"
mongo = PyMongo(app)
paintings_collection = mongo.db.paintings

# MinIO configuration
minio_endpoint = 'http://10.8.0.15:9000'
access_key = 'minioadmin'
secret_key = 'Minio@0710'
bucket_name = 'art1'

s3 = boto3.client('s3',
                  endpoint_url=minio_endpoint,
                  aws_access_key_id=access_key,
                  aws_secret_access_key=secret_key)

@app.route('/get_image/<int:painting_id>', methods=['GET'])
def get_image(painting_id):
    try:
        filename = f'WC_{painting_id}.jpg'  # Replace with your file naming convention
        image_object = s3.get_object(Bucket=bucket_name, Key=filename)
        return send_file(image_object['Body'], mimetype='image/jpg')  # Assuming JPEG images
    except Exception as e:
        print(e)
        return 'Image not found', 404

@app.route('/submit', methods=['GET','POST','DELETE'])
def submit_form():
    global data
    data = request.json
    painting_name = data.get('paintingName')
    painting_id = data.get('paintingId')
    painter = data.get('painter')
    year = data.get('year')
    style = data.get('style')
    medium = data.get('medium')
    dimensions = data.get('dimensions')
    description = data.get('description')
    # file_url = data.get('fileUrl')       

    new_painting = {
        'paintingName': painting_name,
        'paintingId': painting_id,
        'painter' : painter,
        'year' : year,
        'style' : style,
        # 'file':file_url,
        'medium' : medium,
        'dimensions' : dimensions,
        'description' : description,
    }

    try:
        inserted = mongo.db.paintings.insert_one(data)
        print(inserted)
        if inserted:
            return jsonify({'message': 'Form data successfully inserted into MongoDB'}), 200
        
        else:
            return jsonify({'message': 'Failed to insert data into MongoDB'}), 500
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500



@app.route('/search/<painting_id>', methods=['GET','POST'])
def get_painting_by_id(painting_id):
    try:
        # Find the painting in MongoDB based on the provided ID
        painting = paintings_collection.find_one({'paintingId': painting_id})
        
        if painting:
            # Convert ObjectId to string representation
            painting['_id'] = str(painting['_id'])
            
            # Return painting data as JSON response
            return jsonify(painting), 200
        else:
            return jsonify({'error': 'Painting not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500



@app.route('/get', methods=['GET'])
def get_all_paintings():
    try:
        all_paintings = list(paintings_collection.find({}))  # Retrieve all paintings from the 'paintings' collection

        # Convert ObjectId to string representation in each painting dictionary
        for painting in all_paintings:
            painting['_id'] = str(painting['_id'])

        return jsonify(all_paintings), 200  # Return all paintings as JSON response

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({'error': 'Method Not Allowed'}), 405


if __name__ == '__main__':
    app.run(debug=True)

# @app.route('/search/<painting_id>', methods=['GET'])
# def search_painting_by_id(painting_id):
#     painting = mongo.db.paintings.find_one({'paintingId': painting_id})
#     if painting:
#         return jsonify({
#             'paintingName': painting['paintingName'],
#             'year': painting['year']
#         })
#     else:
#         return jsonify({'message': 'Painting not found'}), 404

""" @app.route("/get") #website URL
def hello_world():
    b=mongo.db.firstcollec.find({}) #query firstcollec to find all documents/entries in it and result stored in b
    #print(b,type(b)) #print result and type
    for item in b: #go through searched result b and find type a
        if 'year' in item:
            print(item['year'])
    return b """

    
""" @app.route("/") #website URL
def hello_world():
     return "<p>sup!</p>" """

# @app.route('/find/<search_term>',methods=['GET'])
# def get_result(search_term):
#     painting = mongo.db.paintings.find({'paintingID':search_term}, {'paintingName': 1})
#     if painting:
#         return jsonify(painting)
#     else:
#         return jsonify({'paintingName': None})