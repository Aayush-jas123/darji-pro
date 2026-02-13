"""Notification API endpoints."""

from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.system import Notification, NotificationStatus, NotificationChannel
from app.schemas.notification import (
    NotificationResponse,
    NotificationCreate,
    NotificationUpdate,
    NotificationStats
)

router = APIRouter()


@router.get("/", response_model=List[NotificationResponse])
async def list_notifications(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    unread_only: bool = False,
    channel: Optional[NotificationChannel] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    """
    List notifications for the current user.
    
    Filters:
    - unread_only: Show only unread notifications
    - channel: Filter by notification channel (email, sms, in_app)
    """
    query = select(Notification).where(Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.where(Notification.status != NotificationStatus.DELIVERED)
    
    if channel:
        query = query.where(Notification.channel == channel)
    
    query = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/unread-count", response_model=dict)
async def get_unread_count(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get count of unread notifications."""
    from sqlalchemy import func
    
    query = select(func.count(Notification.id)).where(
        and_(
            Notification.user_id == current_user.id,
            Notification.channel == NotificationChannel.IN_APP,
            Notification.status != NotificationStatus.DELIVERED
        )
    )
    
    result = await db.execute(query)
    count = result.scalar()
    
    return {"unread_count": count or 0}


@router.get("/stats", response_model=NotificationStats)
async def get_notification_stats(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get notification statistics for the current user."""
    from sqlalchemy import func
    
    # Total notifications
    total_query = select(func.count(Notification.id)).where(
        Notification.user_id == current_user.id
    )
    total_result = await db.execute(total_query)
    total = total_result.scalar() or 0
    
    # Unread notifications
    unread_query = select(func.count(Notification.id)).where(
        and_(
            Notification.user_id == current_user.id,
            Notification.channel == NotificationChannel.IN_APP,
            Notification.status != NotificationStatus.DELIVERED
        )
    )
    unread_result = await db.execute(unread_query)
    unread = unread_result.scalar() or 0
    
    # By channel
    email_query = select(func.count(Notification.id)).where(
        and_(
            Notification.user_id == current_user.id,
            Notification.channel == NotificationChannel.EMAIL
        )
    )
    email_result = await db.execute(email_query)
    email_count = email_result.scalar() or 0
    
    in_app_query = select(func.count(Notification.id)).where(
        and_(
            Notification.user_id == current_user.id,
            Notification.channel == NotificationChannel.IN_APP
        )
    )
    in_app_result = await db.execute(in_app_query)
    in_app_count = in_app_result.scalar() or 0
    
    return NotificationStats(
        total=total,
        unread=unread,
        email=email_count,
        in_app=in_app_count,
        sms=0  # Not implemented yet
    )


@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get a specific notification."""
    result = await db.execute(
        select(Notification).where(
            and_(
                Notification.id == notification_id,
                Notification.user_id == current_user.id
            )
        )
    )
    notification = result.scalar_one_or_none()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return notification


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
async def mark_as_read(
    notification_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Mark a notification as read."""
    result = await db.execute(
        select(Notification).where(
            and_(
                Notification.id == notification_id,
                Notification.user_id == current_user.id
            )
        )
    )
    notification = result.scalar_one_or_none()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.status = NotificationStatus.DELIVERED
    notification.delivered_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(notification)
    
    return notification


@router.post("/mark-all-read")
async def mark_all_as_read(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Mark all in-app notifications as read."""
    from sqlalchemy import update
    
    await db.execute(
        update(Notification)
        .where(
            and_(
                Notification.user_id == current_user.id,
                Notification.channel == NotificationChannel.IN_APP,
                Notification.status != NotificationStatus.DELIVERED
            )
        )
        .values(
            status=NotificationStatus.DELIVERED,
            delivered_at=datetime.utcnow()
        )
    )
    
    await db.commit()
    
    return {"message": "All notifications marked as read"}


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Delete a notification."""
    result = await db.execute(
        select(Notification).where(
            and_(
                Notification.id == notification_id,
                Notification.user_id == current_user.id
            )
        )
    )
    notification = result.scalar_one_or_none()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    await db.delete(notification)
    await db.commit()
    
    return {"message": "Notification deleted successfully"}


    return {"message": "All notifications deleted successfully"}


@router.post("/test-email")
async def send_test_email(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    email: Optional[str] = None,
):
    """
    Send a test email to verify SMTP configuration.
    If 'email' is provided, sends to that address. Otherwise sends to current user's email.
    """
    from app.services.notification import notification_service, NotificationChannel
    
    target_email = email or current_user.email
    
    if not target_email:
        raise HTTPException(
            status_code=400, 
            detail="No email address provided and current user has no email set."
        )
    
    try:
        # Create and send a notification
        notification = await notification_service.create_and_send(
            db=db,
            user_id=current_user.id,
            channel=NotificationChannel.EMAIL,
            subject="Test Email from Darji Pro",
            message=f"""
            <html>
                <body style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #4F46E5;">Test Notification</h2>
                    <p>Hello {current_user.full_name},</p>
                    <p>This is a test email from your Darji Pro application.</p>
                    <p>If you are seeing this, your <strong>SMTP Configuration</strong> is working correctly! 🎉</p>
                    <hr>
                    <p style="font-size: 12px; color: #666;">Sent at: {datetime.utcnow()}</p>
                </body>
            </html>
            """,
            recipient_address=target_email
        )
        
        if notification.status == NotificationStatus.DELIVERED or notification.status == NotificationStatus.SENT:
             return {"message": "Test email sent successfully", "notification_id": notification.id}
        else:
             # It might return success=True in dev mode even if failed, but if notification status is FAILED...
             return {
                 "message": "Email queued but might have failed. Check logs.", 
                 "status": notification.status,
                 "error": notification.error_message
             }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send test email: {str(e)}")
