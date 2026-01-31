"""Email notification service."""

from typing import Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

from app.core.config import settings


class EmailService:
    """Email service for sending notifications."""
    
    def __init__(self):
        self.smtp_server = "smtp.gmail.com"  # Change based on provider
        self.smtp_port = 587
        self.sender_email = settings.SMTP_EMAIL if hasattr(settings, 'SMTP_EMAIL') else "noreply@darjipro.com"
        self.sender_password = settings.SMTP_PASSWORD if hasattr(settings, 'SMTP_PASSWORD') else ""
    
    def send_email(self, to_email: str, subject: str, html_content: str) -> bool:
        """Send an email."""
        try:
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = self.sender_email
            message["To"] = to_email
            
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)
            
            # For now, just log (in production, actually send)
            print(f"📧 Email to {to_email}: {subject}")
            print(f"Content: {html_content[:100]}...")
            
            # Uncomment for actual sending:
            # with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
            #     server.starttls()
            #     server.login(self.sender_email, self.sender_password)
            #     server.send_message(message)
            
            return True
        except Exception as e:
            print(f"❌ Email error: {e}")
            return False
    
    def send_appointment_confirmation(
        self,
        customer_email: str,
        customer_name: str,
        appointment_time: datetime,
        service_type: str,
        appointment_id: int
    ):
        """Send appointment confirmation email."""
        subject = "Appointment Confirmation - Darji Pro"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #4F46E5; color: white; padding: 20px; text-align: center;">
                    <h1>Appointment Confirmed!</h1>
                </div>
                <div style="padding: 20px;">
                    <p>Dear {customer_name},</p>
                    <p>Your appointment has been confirmed.</p>
                    
                    <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Appointment Details</h3>
                        <p><strong>Service:</strong> {service_type}</p>
                        <p><strong>Date & Time:</strong> {appointment_time.strftime('%B %d, %Y at %I:%M %p')}</p>
                        <p><strong>Appointment ID:</strong> #{appointment_id}</p>
                    </div>
                    
                    <p>We look forward to seeing you!</p>
                    <p>Best regards,<br>Darji Pro Team</p>
                </div>
            </body>
        </html>
        """
        return self.send_email(customer_email, subject, html_content)
    
    def send_order_status_update(
        self,
        customer_email: str,
        customer_name: str,
        order_number: str,
        old_status: str,
        new_status: str
    ):
        """Send order status update email."""
        subject = f"Order Update - {order_number}"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #10B981; color: white; padding: 20px; text-align: center;">
                    <h1>Order Status Updated</h1>
                </div>
                <div style="padding: 20px;">
                    <p>Dear {customer_name},</p>
                    <p>Your order status has been updated.</p>
                    
                    <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Order: {order_number}</h3>
                        <p><strong>Previous Status:</strong> <span style="text-transform: capitalize;">{old_status.replace('_', ' ')}</span></p>
                        <p><strong>New Status:</strong> <span style="color: #10B981; font-weight: bold; text-transform: capitalize;">{new_status.replace('_', ' ')}</span></p>
                    </div>
                    
                    <p>Track your order anytime at: <a href="https://darji-pro.onrender.com/orders">View Orders</a></p>
                    <p>Best regards,<br>Darji Pro Team</p>
                </div>
            </body>
        </html>
        """
        return self.send_email(customer_email, subject, html_content)
    
    def send_payment_receipt(
        self,
        customer_email: str,
        customer_name: str,
        invoice_number: str,
        amount: float,
        payment_method: str,
        payment_date: datetime
    ):
        """Send payment receipt email."""
        subject = f"Payment Receipt - {invoice_number}"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #059669; color: white; padding: 20px; text-align: center;">
                    <h1>Payment Received</h1>
                </div>
                <div style="padding: 20px;">
                    <p>Dear {customer_name},</p>
                    <p>Thank you for your payment!</p>
                    
                    <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Payment Details</h3>
                        <p><strong>Invoice:</strong> {invoice_number}</p>
                        <p><strong>Amount Paid:</strong> ₹{amount:.2f}</p>
                        <p><strong>Payment Method:</strong> {payment_method.upper()}</p>
                        <p><strong>Date:</strong> {payment_date.strftime('%B %d, %Y at %I:%M %p')}</p>
                    </div>
                    
                    <p>View your invoice at: <a href="https://darji-pro.onrender.com/invoices">View Invoices</a></p>
                    <p>Best regards,<br>Darji Pro Team</p>
                </div>
            </body>
        </html>
        """
        return self.send_email(customer_email, subject, html_content)


# Singleton instance
email_service = EmailService()
