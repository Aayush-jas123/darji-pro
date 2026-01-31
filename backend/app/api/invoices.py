"""Invoice and payment API routes."""

from typing import Annotated, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User, UserRole
from app.models.invoice import Invoice, InvoiceStatus, PaymentMethod
from app.models.order import Order

router = APIRouter()


# Pydantic schemas
class InvoiceCreate(BaseModel):
    order_id: int
    subtotal: float
    tax_amount: float = 0.0
    discount_amount: float = 0.0
    due_days: int = 7


class PaymentRecord(BaseModel):
    payment_method: str
    amount: float
    payment_reference: Optional[str] = None


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_invoice(
    invoice_data: InvoiceCreate,
    current_user: Annotated[User, Depends(require_role([UserRole.ADMIN.value]))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Create invoice for an order. Admin only."""
    
    # Verify order exists
    order_result = await db.execute(select(Order).where(Order.id == invoice_data.order_id))
    order = order_result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Generate invoice number
    import random
    invoice_number = f"INV-{datetime.utcnow().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
    
    # Calculate total
    total = invoice_data.subtotal + invoice_data.tax_amount - invoice_data.discount_amount
    
    # Create invoice
    new_invoice = Invoice(
        order_id=invoice_data.order_id,
        customer_id=order.customer_id,
        invoice_number=invoice_number,
        subtotal=invoice_data.subtotal,
        tax_amount=invoice_data.tax_amount,
        discount_amount=invoice_data.discount_amount,
        total_amount=total,
        status=InvoiceStatus.PENDING,
        issue_date=datetime.utcnow(),
        due_date=datetime.utcnow() + timedelta(days=invoice_data.due_days),
    )
    
    db.add(new_invoice)
    await db.commit()
    await db.refresh(new_invoice)
    
    return new_invoice


@router.get("/")
async def list_invoices(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """List invoices based on user role."""
    
    query = select(Invoice)
    
    # Customers see only their invoices
    if current_user.role == UserRole.CUSTOMER:
        query = query.where(Invoice.customer_id == current_user.id)
    # Admins see all
    
    query = query.order_by(Invoice.created_at.desc())
    result = await db.execute(query)
    invoices = result.scalars().all()
    
    return invoices


@router.get("/{invoice_id}")
async def get_invoice(
    invoice_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get invoice details."""
    
    result = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
    invoice = result.scalar_one_or_none()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Check permissions
    if current_user.role == UserRole.CUSTOMER and invoice.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return invoice


@router.post("/{invoice_id}/payment")
async def record_payment(
    invoice_id: int,
    payment: PaymentRecord,
    current_user: Annotated[User, Depends(require_role([UserRole.ADMIN.value]))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Record a payment for an invoice. Admin only."""
    
    result = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
    invoice = result.scalar_one_or_none()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Update payment details
    invoice.paid_amount += payment.amount
    invoice.payment_method = PaymentMethod(payment.payment_method)
    invoice.payment_reference = payment.payment_reference
    invoice.payment_date = datetime.utcnow()
    
    # Update status
    if invoice.paid_amount >= invoice.total_amount:
        invoice.status = InvoiceStatus.PAID
    elif invoice.paid_amount > 0:
        invoice.status = InvoiceStatus.PARTIALLY_PAID
    
    await db.commit()
    await db.refresh(invoice)
    
    return invoice


@router.patch("/{invoice_id}/status")
async def update_invoice_status(
    invoice_id: int,
    status_value: str,
    current_user: Annotated[User, Depends(require_role([UserRole.ADMIN.value]))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Update invoice status. Admin only."""
    
    result = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
    invoice = result.scalar_one_or_none()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    try:
        invoice.status = InvoiceStatus(status_value)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    await db.commit()
    await db.refresh(invoice)
    
    return invoice
