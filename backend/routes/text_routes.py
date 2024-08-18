import uuid
from flask import Blueprint, json, request, jsonify
from chatScripts.parseComplaint import processComplaint
from model import db, User, Entry
from werkzeug.utils import secure_filename
import os
import textract
from accessDatabase.updateDb import updateDB

text_bp = Blueprint('text_bp', __name__)

# Ensure the uploads directory exists
UPLOAD_FOLDER = 'complaintUploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {'txt', 'json', 'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@text_bp.route('/textQuery', methods=['POST', 'OPTIONS'])
def handle_prompt():
    if request.method == 'OPTIONS':
        return jsonify({}), 200 
    
    if 'complaintFile' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['complaintFile']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        
        # Save the file to the temporary folder
        file.save(file_path)

        file_extension = filename.rsplit('.', 1)[1].lower()
        if file_extension == 'txt':
            file_type = 'TEXT'
            with open(file_path, 'r') as f:
                content = f.read()
        elif file_extension == 'json':
            file_type = 'JSON'
            with open(file_path, 'r') as f:
                content = json.load(f)

        # Extract text from the file
        text = textract.process(file_path).decode('utf-8')

        print('THIS IS THE TEXT: \n\n***', text)

        # Clean up the temporary file
        os.remove(file_path)

        # Extract clerkId from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Invalid or missing Authorization header"}), 401

        clerk_id = auth_header.split(' ')[1]

        if not text:
            return jsonify({"error": "No text extracted from file"}), 400

        # Fetch the user from the database
        user = User.query.filter_by(clerkId=clerk_id).first()

        if not user:
            return jsonify({"error": "User not found"}), 404

        # Process the complaint using AI
        result = processComplaint(text)

        # Parse the result into JSON
        result_data = json.loads(result)
        is_complaint = result_data.get('isComplaint', False)
        summary = result_data.get('summary', '')
        product = result_data.get('product', '')
        sub_product = result_data.get('subProduct', '')

        # Generate a unique entryId
        entry_id = str(uuid.uuid4())

        # Create a new entry and associate it with the user
        new_entry = Entry(
            entryId=entry_id,
            isComplaint=is_complaint,
            product=product,
            subProduct=sub_product,
            entryText=text,
            summary=summary,
            userId=user.id,
            fileType=file_type
        )

        db.session.add(new_entry)
        db.session.commit()

        print(f"Received text result: {result_data}")

        return jsonify({
            "message": "File processed successfully",
            "entryId": entry_id,
            "isComplaint": is_complaint,
            "summary": summary,
            "product": product,
            "subProduct": sub_product,
            "fileType": file_type,
            "user": {
                "id": user.id,
                "clerkId": user.clerkId,
                "email": user.email
            }
        }), 201
        # Update the database with the result
        return updateDB(file_type, text, user, result)

