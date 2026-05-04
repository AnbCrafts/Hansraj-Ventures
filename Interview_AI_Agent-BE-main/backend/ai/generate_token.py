from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ['https://www.googleapis.com/auth/drive.file']

def generate_token():
    flow = InstalledAppFlow.from_client_secrets_file(
    'client_secret.json',
    SCOPES,
    redirect_uri='http://localhost'
)

    auth_url, _ = flow.authorization_url(prompt='consent')

    print("\n👉 Open this URL in your browser:\n")
    print(auth_url)

    code = input("\n👉 Paste the authorization code here:\n")

    flow.fetch_token(code=code)

    creds = flow.credentials

    with open('token.json', 'w') as token:
        token.write(creds.to_json())

    print("\n✅ token.json generated successfully!")

if __name__ == "__main__":
    generate_token()