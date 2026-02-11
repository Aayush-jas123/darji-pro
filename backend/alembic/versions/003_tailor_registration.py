"""Add tailor registration fields to users table

Revision ID: 003_tailor_registration
Revises: 002_orders_invoices
Create Date: 2026-02-08 03:20:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003_tailor_registration'
down_revision = '002_orders_invoices'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns to users table
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_columns = [col['name'] for col in inspector.get_columns('users')]
    existing_indexes = [idx['name'] for idx in inspector.get_indexes('users')]

    if 'account_status' not in existing_columns:
        op.add_column('users', sa.Column('account_status', sa.String(length=20), server_default='active', nullable=False))
    if 'email_verified' not in existing_columns:
        op.add_column('users', sa.Column('email_verified', sa.Boolean(), server_default='false', nullable=False))
    if 'email_verification_token' not in existing_columns:
        op.add_column('users', sa.Column('email_verification_token', sa.String(length=255), nullable=True))
    if 'email_verification_sent_at' not in existing_columns:
        op.add_column('users', sa.Column('email_verification_sent_at', sa.DateTime(), nullable=True))
    
    if 'approval_notes' not in existing_columns:
        op.add_column('users', sa.Column('approval_notes', sa.Text(), nullable=True))
    if 'approved_by_id' not in existing_columns:
        op.add_column('users', sa.Column('approved_by_id', sa.Integer(), nullable=True))
    if 'approved_at' not in existing_columns:
        op.add_column('users', sa.Column('approved_at', sa.DateTime(), nullable=True))
    
    if 'experience_years' not in existing_columns:
        op.add_column('users', sa.Column('experience_years', sa.Integer(), nullable=True))
    if 'specialization' not in existing_columns:
        op.add_column('users', sa.Column('specialization', sa.String(length=500), nullable=True))
    if 'bio' not in existing_columns:
        op.add_column('users', sa.Column('bio', sa.Text(), nullable=True))
    
    # Create index for account_status
    if 'ix_users_account_status' not in existing_indexes:
        op.create_index(op.f('ix_users_account_status'), 'users', ['account_status'], unique=False)


def downgrade() -> None:
    # Drop index
    op.drop_index(op.f('ix_users_account_status'), table_name='users')
    
    # Drop columns
    op.drop_column('users', 'bio')
    op.drop_column('users', 'specialization')
    op.drop_column('users', 'experience_years')
    
    op.drop_column('users', 'approved_at')
    op.drop_column('users', 'approved_by_id')
    op.drop_column('users', 'approval_notes')
    
    op.drop_column('users', 'email_verification_sent_at')
    op.drop_column('users', 'email_verification_token')
    op.drop_column('users', 'email_verified')
    op.drop_column('users', 'account_status')
