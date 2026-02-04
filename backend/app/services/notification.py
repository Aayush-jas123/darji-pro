"""Notification service for creating and managing notifications."""

from typing import Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.system import Notification, NotificationChannel, NotificationStatus
from app.models.user import User
from app.services.email import email_service


class NotificationService:
    """Service for creating and sending notifications."""
    
    @staticmethod
    async def create_notification(
        db: AsyncSession,
        user_id: int,
        channel: NotificationChannel,
        subject: str,
        message: str,
        recipient_address: str,
        related_resource_type: Optional[str] = None,
        related_resource_id: Optional[int] = None,
        template_name: Optional[str] = None,
        template_data: Optional[dict] = None,
    ) -> Notification:
        """Create a new notification in the database."""
        notification = Notification(
            user_id=user_id,
            channel=channel,
            subject=subject,
            message=message,
            recipient_address=recipient_address,
            related_resource_type=related_resource_type,
            related_resource_id=related_resource_id,
            template_name=template_name,
            template_data=template_data,
            status=NotificationStatus.PENDING
        )
        
        db.add(notification)
        await db.commit()
        await db.refresh(notification)
        
        return notification
    
    @staticmethod
    async def send_notification(db: AsyncSession, notification: Notification) -> bool:
        """Send a notification based on its channel."""
        try:
            if notification.channel == NotificationChannel.EMAIL:
                success = email_service.send_email(
                    to_email=notification.recipient_address,
                    subject=notification.subject or "Notification from Darji Pro",
                    html_content=notification.message
                )
            elif notification.channel == NotificationChannel.IN_APP:
                # In-app notifications are just stored in DB
                success = True
            elif notification.channel == NotificationChannel.SMS:
                # SMS not implemented yet
                print(f"📱 SMS to {notification.recipient_address}: {notification.message}")
                success = True
            else:
                success = False
            
            if success:
                notification.status = NotificationStatus.SENT
                notification.sent_at = datetime.utcnow()
                # For in-app, mark as sent but not delivered (user hasn't read it yet)
                if notification.channel != NotificationChannel.IN_APP:
                    notification.status = NotificationStatus.DELIVERED
                    notification.delivered_at = datetime.utcnow()
            else:
                notification.status = NotificationStatus.FAILED
                notification.failed_at = datetime.utcnow()
                notification.retry_count += 1
            
            await db.commit()
            await db.refresh(notification)
            
            return success
            
        except Exception as e:
            notification.status = NotificationStatus.FAILED
            notification.failed_at = datetime.utcnow()
            notification.error_message = str(e)
            notification.retry_count += 1
            
            await db.commit()
            await db.refresh(notification)
            
            return False
    
    @staticmethod
    async def create_and_send(
        db: AsyncSession,
        user_id: int,
        channel: NotificationChannel,
        subject: str,
        message: str,
        recipient_address: str,
        related_resource_type: Optional[str] = None,
        related_resource_id: Optional[int] = None,
    ) -> Notification:
        """Create and immediately send a notification."""
        notification = await NotificationService.create_notification(
            db=db,
            user_id=user_id,
            channel=channel,
            subject=subject,
            message=message,
            recipient_address=recipient_address,
            related_resource_type=related_resource_type,
            related_resource_id=related_resource_id
        )
        
        await NotificationService.send_notification(db, notification)
        
        return notification
    
    @staticmethod
    async def send_appointment_confirmation(
        db: AsyncSession,
        user: User,
        appointment_id: int,
        appointment_time: datetime,
        service_type: str
    ):
        """Send appointment confirmation notifications."""
        # Email notification
        if user.email:
            email_html = f"""
            <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #4F46E5; color: white; padding: 20px; text-align: center;">
                        <h1>Appointment Confirmed!</h1>
                    </div>
                    <div style="padding: 20px;">
                        <p>Dear {user.full_name},</p>
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
            
            await NotificationService.create_and_send(
                db=db,
                user_id=user.id,
                channel=NotificationChannel.EMAIL,
                subject="Appointment Confirmation - Darji Pro",
                message=email_html,
                recipient_address=user.email,
                related_resource_type="appointment",
                related_resource_id=appointment_id
            )
        
        # In-app notification
        await NotificationService.create_and_send(
            db=db,
            user_id=user.id,
            channel=NotificationChannel.IN_APP,
            subject="Appointment Confirmed",
            message=f"Your appointment for {service_type} on {appointment_time.strftime('%B %d, %Y at %I:%M %p')} has been confirmed.",
            recipient_address="in_app",
            related_resource_type="appointment",
            related_resource_id=appointment_id
        )
    
    @staticmethod
    async def send_order_status_update(
        db: AsyncSession,
        user: User,
        order_id: int,
        order_number: str,
        old_status: str,
        new_status: str
    ):
        """Send order status update notifications."""
        # Email notification
        if user.email:
            email_html = f"""
            <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #10B981; color: white; padding: 20px; text-align: center;">
                        <h1>Order Status Updated</h1>
                    </div>
                    <div style="padding: 20px;">
                        <p>Dear {user.full_name},</p>
                        <p>Your order status has been updated.</p>
                        
                        <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">Order: {order_number}</h3>
                            <p><strong>Previous Status:</strong> <span style="text-transform: capitalize;">{old_status.replace('_', ' ')}</span></p>
                            <p><strong>New Status:</strong> <span style="color: #10B981; font-weight: bold; text-transform: capitalize;">{new_status.replace('_', ' ')}</span></p>
                        </div>
                        
                        <p>Track your order anytime in your dashboard.</p>
                        <p>Best regards,<br>Darji Pro Team</p>
                    </div>
                </body>
            </html>
            """
            
            await NotificationService.create_and_send(
                db=db,
                user_id=user.id,
                channel=NotificationChannel.EMAIL,
                subject=f"Order Update - {order_number}",
                message=email_html,
                recipient_address=user.email,
                related_resource_type="order",
                related_resource_id=order_id
            )
        
        # In-app notification
        await NotificationService.create_and_send(
            db=db,
            user_id=user.id,
            channel=NotificationChannel.IN_APP,
            subject="Order Status Updated",
            message=f"Your order {order_number} status has been updated to {new_status.replace('_', ' ').title()}.",
            recipient_address="in_app",
            related_resource_type="order",
            related_resource_id=order_id
        )


# Singleton instance
notification_service = NotificationService()
