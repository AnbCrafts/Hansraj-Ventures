import os
from smtplib import SMTP
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from models.adminModel import Admin
from models.settingModel import Setting

load_dotenv()

def send_email(admin_id, subject, html_message, email, cc1=None):
    # If no admin_id -> fallback to first superadmin with valid mail settings
    if not admin_id:
        admin = Admin.objects(role="superadmin", mail_settings__exists=True).first()
        if not admin:
            raise Exception("No superadmin with mail settings configured")
    else:
        admin = Admin.objects(id=admin_id).first()

    if not admin or not admin.mail_settings:
        raise Exception("Mail settings not configured for this admin")

    ms = admin.mail_settings

    # fetch encrypted SMTP password
    smtp_password = ms.get_smtp_password()

    sender_email = ms.email_from

    host = ms.smtp_host
    port = int(ms.smtp_port)

    server = SMTP(host, port)

    if ms.smtp_use_tls:
        server.starttls()

    server.login(ms.smtp_username, smtp_password)

    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = email
    msg["Cc"] = cc1 if cc1 else ""
    msg["Subject"] = subject
    msg.attach(MIMEText(html_message, "html"))

    recipients = [email]
    if cc1:
        recipients.append(cc1)

    server.sendmail(sender_email, recipients, msg.as_string())
    server.quit()

    return "success"

