"""Order API routes for order management and tracking."""

from typing import Annotated, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User, UserRole
from app.models.order import Order, OrderStatus
from app.models.appointment import Appointment

router = APIRouter()


# Pydantic schemas
class OrderCreate(BaseModel):
    appointment_id: int
    garment_type: str
    fabric_details: Optional[str] = None
    design_notes: Optional[str] = None
    estimated_price: Optional[float] = None
    estimated_delivery: Optional[datetime] = None


class OrderUpdate(BaseModel):
    status: Optional[str] = None
    fabric_details: Optional[str] = None
    design_notes: Optional[str] = None
    estimated_price: Optional[float] = None
    final_price: Optional[float] = None
    estimated_delivery: Optional[datetime] = None
    actual_delivery: Optional[datetime] = None


# Admin/Tailor endpoints
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    current_user: Annotated[User, Depends(require_role([UserRole.ADMIN.value, UserRole.TAILOR.value]))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Create a new order from an appointment.
    
    Admin or Tailor only.
    """
    # Verify appointment exists
    appt_result = await db.execute(
        select(Appointment).where(Appointment.id == order_data.appointment_id)
    )
    appointment = appt_result.scalar_one_or_none()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Generate order number
    import random
    order_number = f"ORD-{datetime.utcnow().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
    
    # Create order
    new_order = Order(
        appointment_id=order_data.appointment_id,
        customer_id=appointment.customer_id,
        tailor_id=appointment.tailor_id,
        order_number=order_number,
        garment_type=order_data.garment_type,
        fabric_details=order_data.fabric_details,
        design_notes=order_data.design_notes,
        estimated_price=order_data.estimated_price,
        estimated_delivery=order_data.estimated_delivery,
        status=OrderStatus.PENDING,
    )
    
    db.add(new_order)
    await db.commit()
    await db.refresh(new_order)
    
    return new_order


@router.get("/")
async def list_orders(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    """
    List orders based on user role.
    
    - Customers see their own orders
    - Tailors see their assigned orders
    - Admins see all orders
    """
    query = select(Order)
    
    # Apply role-based filtering
    if current_user.role == UserRole.CUSTOMER:
        query = query.where(Order.customer_id == current_user.id)
    elif current_user.role == UserRole.TAILOR:
        query = query.where(Order.tailor_id == current_user.id)
    # Admins see all orders (no filter)
    
    # Apply status filter
    if status_filter:
        query = query.where(Order.status == status_filter)
    
    # Apply pagination
    query = query.offset(skip).limit(limit).order_by(Order.created_at.desc())
    
    result = await db.execute(query)
    orders = result.scalars().all()
    
    return orders


@router.get("/{order_id}")
async def get_order(
    order_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Get order details.
    
    Users can only view their own orders (customer/tailor) or all orders (admin).
    """
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check permissions
    if current_user.role == UserRole.CUSTOMER and order.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role == UserRole.TAILOR and order.tailor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return order


@router.patch("/{order_id}")
async def update_order(
    order_id: int,
    order_update: OrderUpdate,
    current_user: Annotated[User, Depends(require_role([UserRole.ADMIN.value, UserRole.TAILOR.value]))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Update order details and status.
    
    Admin or Tailor only.
    """
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Tailor can only update their own orders
    if current_user.role == UserRole.TAILOR and order.tailor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Update fields
    if order_update.status:
        try:
            order.status = OrderStatus(order_update.status)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid status")
    
    if order_update.fabric_details is not None:
        order.fabric_details = order_update.fabric_details
    
    if order_update.design_notes is not None:
        order.design_notes = order_update.design_notes
    
    if order_update.estimated_price is not None:
        order.estimated_price = order_update.estimated_price
    
    if order_update.final_price is not None:
        order.final_price = order_update.final_price
    
    if order_update.estimated_delivery is not None:
        order.estimated_delivery = order_update.estimated_delivery
    
    if order_update.actual_delivery is not None:
        order.actual_delivery = order_update.actual_delivery
    
    await db.commit()
    await db.refresh(order)
    
    return order


@router.delete("/{order_id}")
async def delete_order(
    order_id: int,
    current_user: Annotated[User, Depends(require_role([UserRole.ADMIN.value]))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Delete an order.
    
    Admin only.
    """
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    await db.delete(order)
    await db.commit()
    
    return {"message": "Order deleted successfully", "order_id": order_id}
