"""Add orders and invoices tables

Revision ID: 002_orders_invoices
Revises: 001_initial
Create Date: 2026-02-01 13:15:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002_orders_invoices'
down_revision = '001_initial'
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    # Create orders table
    if 'orders' not in tables:
        op.create_table('orders',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('appointment_id', sa.Integer(), nullable=False),
        sa.Column('customer_id', sa.Integer(), nullable=False),
        sa.Column('tailor_id', sa.Integer(), nullable=True),
        sa.Column('order_number', sa.String(length=50), nullable=False),
        sa.Column('garment_type', sa.String(length=100), nullable=False),
        sa.Column('fabric_details', sa.Text(), nullable=True),
        sa.Column('design_notes', sa.Text(), nullable=True),
        sa.Column('status', sa.Enum('PENDING', 'CUTTING', 'STITCHING', 'FINISHING', 'QUALITY_CHECK', 'READY', 'DELIVERED', 'CANCELLED', name='orderstatus'), nullable=False),
        sa.Column('estimated_price', sa.Float(), nullable=True),
        sa.Column('final_price', sa.Float(), nullable=True),
        sa.Column('estimated_delivery', sa.DateTime(timezone=True), nullable=True),
        sa.Column('actual_delivery', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['appointment_id'], ['appointments.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['customer_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tailor_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('order_number')
        )
    
    if 'orders' in tables or 'orders' in inspector.get_table_names():
        orders_indexes = [idx['name'] for idx in inspector.get_indexes('orders')]
        if 'ix_orders_customer_id' not in orders_indexes:
            op.create_index(op.f('ix_orders_customer_id'), 'orders', ['customer_id'], unique=False)
        if 'ix_orders_id' not in orders_indexes:
            op.create_index(op.f('ix_orders_id'), 'orders', ['id'], unique=False)
        if 'ix_orders_order_number' not in orders_indexes:
            op.create_index(op.f('ix_orders_order_number'), 'orders', ['order_number'], unique=True)
        if 'ix_orders_status' not in orders_indexes:
            op.create_index(op.f('ix_orders_status'), 'orders', ['status'], unique=False)
        if 'ix_orders_tailor_id' not in orders_indexes:
            op.create_index(op.f('ix_orders_tailor_id'), 'orders', ['tailor_id'], unique=False)

    # Create invoices table
    if 'invoices' not in tables:
        op.create_table('invoices',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('customer_id', sa.Integer(), nullable=False),
        sa.Column('invoice_number', sa.String(length=50), nullable=False),
        sa.Column('subtotal', sa.Float(), nullable=False),
        sa.Column('tax_amount', sa.Float(), nullable=False),
        sa.Column('discount_amount', sa.Float(), nullable=False),
        sa.Column('total_amount', sa.Float(), nullable=False),
        sa.Column('paid_amount', sa.Float(), nullable=False),
        sa.Column('status', sa.Enum('DRAFT', 'PENDING', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED', name='invoicestatus'), nullable=False),
        sa.Column('payment_method', sa.Enum('CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'RAZORPAY', 'STRIPE', name='paymentmethod'), nullable=True),
        sa.Column('payment_reference', sa.String(length=255), nullable=True),
        sa.Column('payment_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('issue_date', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('due_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['customer_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('invoice_number')
        )
    
    if 'invoices' in tables or 'invoices' in inspector.get_table_names():
        invoices_indexes = [idx['name'] for idx in inspector.get_indexes('invoices')]
        if 'ix_invoices_customer_id' not in invoices_indexes:
            op.create_index(op.f('ix_invoices_customer_id'), 'invoices', ['customer_id'], unique=False)
        if 'ix_invoices_id' not in invoices_indexes:
            op.create_index(op.f('ix_invoices_id'), 'invoices', ['id'], unique=False)
        if 'ix_invoices_invoice_number' not in invoices_indexes:
            op.create_index(op.f('ix_invoices_invoice_number'), 'invoices', ['invoice_number'], unique=True)
        if 'ix_invoices_order_id' not in invoices_indexes:
            op.create_index(op.f('ix_invoices_order_id'), 'invoices', ['order_id'], unique=False)
        if 'ix_invoices_status' not in invoices_indexes:
            op.create_index(op.f('ix_invoices_status'), 'invoices', ['status'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_invoices_status'), table_name='invoices')
    op.drop_index(op.f('ix_invoices_order_id'), table_name='invoices')
    op.drop_index(op.f('ix_invoices_invoice_number'), table_name='invoices')
    op.drop_index(op.f('ix_invoices_id'), table_name='invoices')
    op.drop_index(op.f('ix_invoices_customer_id'), table_name='invoices')
    op.drop_table('invoices')
    op.drop_index(op.f('ix_orders_tailor_id'), table_name='orders')
    op.drop_index(op.f('ix_orders_status'), table_name='orders')
    op.drop_index(op.f('ix_orders_order_number'), table_name='orders')
    op.drop_index(op.f('ix_orders_id'), table_name='orders')
    op.drop_index(op.f('ix_orders_customer_id'), table_name='orders')
    op.drop_table('orders')
