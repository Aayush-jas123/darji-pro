"""Analytics and reports API endpoints."""

from typing import Annotated
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models.user import User, UserRole
from app.models.order import Order, OrderStatus
from app.models.invoice import Invoice, InvoiceStatus
from app.models.appointment import Appointment, AppointmentStatus

router = APIRouter()

get_admin_user = require_role([UserRole.ADMIN.value])


@router.get("/revenue")
async def get_revenue_report(
    current_user: Annotated[User, Depends(get_admin_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    days: int = Query(30, description="Number of days to analyze"),
):
    """Get revenue report. Admin only."""
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Total revenue (paid invoices)
    total_revenue_result = await db.execute(
        select(func.sum(Invoice.paid_amount)).where(
            Invoice.payment_date >= start_date,
            Invoice.status.in_([InvoiceStatus.PAID, InvoiceStatus.PARTIALLY_PAID])
        )
    )
    total_revenue = total_revenue_result.scalar() or 0
    
    # Pending revenue
    pending_revenue_result = await db.execute(
        select(func.sum(Invoice.total_amount - Invoice.paid_amount)).where(
            Invoice.status == InvoiceStatus.PENDING
        )
    )
    pending_revenue = pending_revenue_result.scalar() or 0
    
    # Number of paid invoices
    paid_invoices_result = await db.execute(
        select(func.count(Invoice.id)).where(
            Invoice.payment_date >= start_date,
            Invoice.status == InvoiceStatus.PAID
        )
    )
    paid_invoices = paid_invoices_result.scalar()
    
    # Average order value
    avg_order_value = total_revenue / paid_invoices if paid_invoices > 0 else 0
    
    return {
        "period_days": days,
        "total_revenue": float(total_revenue),
        "pending_revenue": float(pending_revenue),
        "paid_invoices": paid_invoices,
        "average_order_value": float(avg_order_value),
    }


@router.get("/popular-fabrics")
async def get_popular_fabrics(
    current_user: Annotated[User, Depends(get_admin_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get popular fabric types. Admin only."""
    
    # Group by fabric details (simplified - in production, parse fabric_details field)
    result = await db.execute(
        select(
            Order.fabric_details,
            func.count(Order.id).label('count')
        ).where(
            Order.fabric_details.isnot(None)
        ).group_by(Order.fabric_details).order_by(func.count(Order.id).desc()).limit(10)
    )
    
    fabrics = [{"fabric": row[0], "count": row[1]} for row in result.all()]
    
    return fabrics


@router.get("/tailor-performance")
async def get_tailor_performance(
    current_user: Annotated[User, Depends(get_admin_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get tailor performance metrics. Admin only."""
    
    # Get all tailors
    tailors_result = await db.execute(
        select(User).where(User.role == UserRole.TAILOR)
    )
    tailors = tailors_result.scalars().all()
    
    performance = []
    
    for tailor in tailors:
        # Total orders
        total_orders_result = await db.execute(
            select(func.count(Order.id)).where(Order.tailor_id == tailor.id)
        )
        total_orders = total_orders_result.scalar()
        
        # Completed orders
        completed_orders_result = await db.execute(
            select(func.count(Order.id)).where(
                Order.tailor_id == tailor.id,
                Order.status == OrderStatus.DELIVERED
            )
        )
        completed_orders = completed_orders_result.scalar()
        
        # Completion rate
        completion_rate = (completed_orders / total_orders * 100) if total_orders > 0 else 0
        
        # Total appointments
        total_appointments_result = await db.execute(
            select(func.count(Appointment.id)).where(Appointment.tailor_id == tailor.id)
        )
        total_appointments = total_appointments_result.scalar()
        
        performance.append({
            "tailor_id": tailor.id,
            "tailor_name": tailor.full_name,
            "total_orders": total_orders,
            "completed_orders": completed_orders,
            "completion_rate": round(completion_rate, 2),
            "total_appointments": total_appointments,
        })
    
    # Sort by completion rate
    performance.sort(key=lambda x: x['completion_rate'], reverse=True)
    
    return performance


@router.get("/order-trends")
async def get_order_trends(
    current_user: Annotated[User, Depends(get_admin_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    days: int = Query(30, description="Number of days"),
):
    """Get order trends over time. Admin only."""
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Orders by status
    status_counts = {}
    for status in OrderStatus:
        result = await db.execute(
            select(func.count(Order.id)).where(
                Order.created_at >= start_date,
                Order.status == status
            )
        )
        status_counts[status.value] = result.scalar()
    
    # Total orders in period
    total_result = await db.execute(
        select(func.count(Order.id)).where(Order.created_at >= start_date)
    )
    total_orders = total_result.scalar()
    
    return {
        "period_days": days,
        "total_orders": total_orders,
        "by_status": status_counts,
    }
