from flask import jsonify
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
import io, os, base64, json, mimetypes, webbrowser
from dotenv import load_dotenv
from google.auth.transport.requests import Request 

load_dotenv()

# Google Drive credentials
# SERVICE_ACCOUNT_FILE = "service_account.json"
SCOPES = ['https://www.googleapis.com/auth/drive.file']
PARENT_FOLDER_ID = os.getenv("PARENT_FOLDER_ID")



def authenticate():

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    token_path = os.path.join(BASE_DIR, 'token.json')

    if not os.path.exists(token_path):
        raise Exception("❌ token.json not found. Generate it first.")

    creds = Credentials.from_authorized_user_file(token_path, SCOPES)

    # Auto refresh if expired
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())

        # Save updated token
        with open(token_path, 'w') as token:
            token.write(creds.to_json())

    return build('drive', 'v3', credentials=creds)


def create_folder(service, parent_id, folder_name):
    """Creates a folder in Google Drive if it doesn't exist and returns its ID."""
    try:
        # Check if the folder exists
        query = f"mimeType='application/vnd.google-apps.folder' and name='{folder_name}' and '{parent_id}' in parents and trashed=false"
        response = service.files().list(q=query, fields="files(id)").execute()
        folders = response.get("files", [])

        if folders:
            return folders[0]['id']

        # Create the folder
        folder_metadata = {
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder',
            'parents': [parent_id]
        }
        folder = service.files().create(body=folder_metadata, fields="id").execute()
        return folder['id']

    except Exception as e:
        print(f"❌ Error creating folder '{folder_name}': {e}")
        return None

def make_file_public(service, file_id):
    """Makes a Google Drive file publicly accessible."""
    try:
        permission = {
            "type": "anyone",
            "role": "reader"
        }
        service.permissions().create(fileId=file_id, body=permission).execute()
        # return f"https://lh3.googleusercontent.com/d/{file_id}"
        return f"https://drive.google.com/file/d/{file_id}/view?usp=drivesdk"

    except Exception as e:
        print(f"\u274c Error making file public: {e}")
        return None
    
def upload_ss_drive(file_bytes, cand_id, type, filename, mime_type=None):
    try:
        if not file_bytes or not cand_id or not type or not filename:
            return jsonify({"error": "Missing required fields"}), 400

        # Authenticate and initialize service
        service = authenticate()
        if not service:
            return jsonify({"error": "Failed to authenticate with Google Drive"}), 500

        # Ensure the folder structure exists
        candidate_folder_id = create_folder(service, PARENT_FOLDER_ID, cand_id)
        type_folder_id = create_folder(service, candidate_folder_id, type)

        # Prepare file for upload
        file_stream = io.BytesIO(file_bytes)

        file_metadata = {
            "name": filename,
            "parents": [type_folder_id]
        }

        media = MediaIoBaseUpload(file_stream, mimetype=mime_type, resumable=True)

        uploaded_file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields="id"
        ).execute()

        file_id = uploaded_file.get("id")
        # Make it public (optional)
        service.permissions().create(
            fileId=file_id,
            body={"type": "anyone", "role": "reader"},
            fields="id"
        ).execute()

        return f"https://drive.google.com/file/d/{file_id}/view?usp=drivesdk"

        return public_link

    except Exception as e:
        print(f"❌ Error in upload_ss_drive: {e}")
        return ""


def delete_from_drive(file_id):
    try:
        service = authenticate()
        if not service:
            return make_response(msg="Failed to authenticate with Google Drive", status_code=500)

        try:
            service.files().delete(fileId=file_id).execute()
        except Exception as e:
            return make_response(msg=f"Failed to delete file from Drive: {str(e)}", status_code=500)
        return True
    except Exception as e:
        print("Drive deletion error:", e)
        return False