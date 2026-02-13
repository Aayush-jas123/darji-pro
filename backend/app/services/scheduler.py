
import asyncio
from datetime import datetime, timedelta
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from app.core.database import AsyncSessionLocal
from app.models.appointment import Appointment, AppointmentStatus
from app.models.user import User
from app.services.notification import notification_service, NotificationChannel
from app.core.config import settings

scheduler = AsyncIOScheduler()

async def send_appointment_reminders():
    """
    Check for appointments scheduled for tomorrow and send reminders.
    """
    print("⏰ [Scheduler] Running daily appointment reminder check...")
    
    async with AsyncSessionLocal() as db:
        try:
            # Calculate tomorrow's range
            now = datetime.utcnow()
            tomorrow = now + timedelta(days=1)
            start_of_tomorrow = tomorrow.replace(hour=0, minute=0, second=0, microsecond=0)
            end_of_tomorrow = tomorrow.replace(hour=23, minute=59, second=59, microsecond=999999)

            # Query confirmed appointments for tomorrow
            stmt = select(Appointment).options(
                selectinload(Appointment.customer),
                selectinload(Appointment.tailor)
            ).where(
                and_(
                    Appointment.scheduled_date >= start_of_tomorrow,
                    Appointment.scheduled_date <= end_of_tomorrow,
                    Appointment.status == AppointmentStatus.CONFIRMED
                )
            )
            
            result = await db.execute(stmt)
            appointments = result.scalars().all()
            
            print(f"📅 [Scheduler] Found {len(appointments)} appointments for tomorrow ({start_of_tomorrow.date()}).")

            for appointment in appointments:
                 if not appointment.customer or not appointment.customer.email:
                     continue
                 
                 # Construct message
                 subject = "Reminder: Your Appointment Tomorrow - Darji Pro"
                 time_str = appointment.scheduled_date.strftime("%I:%M %p")
                 
                 message = f"""
                 <html>
                    <body style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2 style="color: #4F46E5;">Appointment Reminder</h2>
                        <p>Hello {appointment.customer.full_name},</p>
                        <p>This is a reminder for your upcoming appointment with <strong>{appointment.tailor.full_name}</strong>.</p>
                        
                        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Date:</strong> {appointment.scheduled_date.strftime('%B %d, %Y')}</p>
                            <p><strong>Time:</strong> {time_str}</p>
                            <p><strong>Type:</strong> {appointment.appointment_type.value.title()}</p>
                        </div>
                        
                        <p>Please ensure you arrive on time. If you need to reschedule, please visit your dashboard.</p>
                        <hr>
                        <p style="font-size: 12px; color: #666;">Darji Pro Team</p>
                    </body>
                 </html>
                 """

                 # Send notification
                 try:
                     await notification_service.create_and_send(
                         db=db,
                         user_id=appointment.customer_id,
                         channel=NotificationChannel.EMAIL,
                         subject=subject,
                         message=message,
                         recipient_address=appointment.customer.email,
                         related_resource_type="appointment",
                         related_resource_id=appointment.id
                     )
                     print(f"✅ [Scheduler] Sent reminder to {appointment.customer.email} for Appointment #{appointment.id}")
                 except Exception as e:
                     print(f"❌ [Scheduler] Failed to send reminder for Appointment #{appointment.id}: {e}")
                     
        except Exception as e:
            print(f"❌ [Scheduler] Error in reminder loop: {e}")

def start_scheduler():
    """Start the application scheduler."""
    if not settings.TESTING: # Don't start in tests
        # Run daily at 8:00 AM UTC
        scheduler.add_job(
            send_appointment_reminders, 
            CronTrigger(hour=8, minute=0),
            id="daily_reminders",
            replace_existing=True
        )
        
        # Also run once on startup (dev only) for verification if needed
        # if settings.DEFAULT_ENV == "development":
        #    scheduler.add_job(send_appointment_reminders, 'date', run_date=datetime.now() + timedelta(seconds=10))
        
        scheduler.start()
        print("🕒 [Scheduler] Started. Daily reminders scheduled for 08:00 UTC.")
