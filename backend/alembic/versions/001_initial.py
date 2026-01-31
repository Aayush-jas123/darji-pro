"""Initial migration - create all tables

Revision ID: 001_initial
Revises: 
Create Date: 2026-01-31 23:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('phone', sa.String(length=20), nullable=True),
    sa.Column('full_name', sa.String(length=255), nullable=False),
    sa.Column('hashed_password', sa.String(length=255), nullable=False),
    sa.Column('role', sa.Enum('CUSTOMER', 'TAILOR', 'ADMIN', name='userrole'), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('is_verified', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('last_login', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_phone'), 'users', ['phone'], unique=False)

    # Create branches table
    op.create_table('branches',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('address', sa.Text(), nullable=False),
    sa.Column('city', sa.String(length=100), nullable=False),
    sa.Column('state', sa.String(length=100), nullable=False),
    sa.Column('pincode', sa.String(length=10), nullable=False),
    sa.Column('phone', sa.String(length=20), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )

    # Create measurement_profiles table
    op.create_table('measurement_profiles',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('profile_name', sa.String(length=255), nullable=False),
    sa.Column('is_default', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_measurement_profiles_user_id'), 'measurement_profiles', ['user_id'], unique=False)

    # Create measurement_versions table
    op.create_table('measurement_versions',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('profile_id', sa.Integer(), nullable=False),
    sa.Column('version_number', sa.Integer(), nullable=False),
    sa.Column('height', sa.Float(), nullable=True),
    sa.Column('weight', sa.Float(), nullable=True),
    sa.Column('chest', sa.Float(), nullable=True),
    sa.Column('waist', sa.Float(), nullable=True),
    sa.Column('hips', sa.Float(), nullable=True),
    sa.Column('shoulder_width', sa.Float(), nullable=True),
    sa.Column('sleeve_length', sa.Float(), nullable=True),
    sa.Column('inseam', sa.Float(), nullable=True),
    sa.Column('neck', sa.Float(), nullable=True),
    sa.Column('fit_preference', sa.String(length=50), nullable=True),
    sa.Column('notes', sa.Text(), nullable=True),
    sa.Column('measured_by_id', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['measured_by_id'], ['users.id'], ),
    sa.ForeignKeyConstraint(['profile_id'], ['measurement_profiles.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_measurement_versions_profile_id'), 'measurement_versions', ['profile_id'], unique=False)

    # Create appointments table
    op.create_table('appointments',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('customer_id', sa.Integer(), nullable=False),
    sa.Column('tailor_id', sa.Integer(), nullable=True),
    sa.Column('branch_id', sa.Integer(), nullable=False),
    sa.Column('scheduled_time', sa.DateTime(timezone=True), nullable=False),
    sa.Column('service_type', sa.String(length=100), nullable=False),
    sa.Column('status', sa.Enum('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', name='appointmentstatus'), nullable=False),
    sa.Column('notes', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['branch_id'], ['branches.id'], ),
    sa.ForeignKeyConstraint(['customer_id'], ['users.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['tailor_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_appointments_customer_id'), 'appointments', ['customer_id'], unique=False)
    op.create_index(op.f('ix_appointments_scheduled_time'), 'appointments', ['scheduled_time'], unique=False)
    op.create_index(op.f('ix_appointments_status'), 'appointments', ['status'], unique=False)

    # Create tailor_availability table
    op.create_table('tailor_availability',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('tailor_id', sa.Integer(), nullable=False),
    sa.Column('branch_id', sa.Integer(), nullable=False),
    sa.Column('day_of_week', sa.Integer(), nullable=False),
    sa.Column('start_time', sa.Time(), nullable=False),
    sa.Column('end_time', sa.Time(), nullable=False),
    sa.Column('is_available', sa.Boolean(), nullable=False),
    sa.ForeignKeyConstraint(['branch_id'], ['branches.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['tailor_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('tailor_availability')
    op.drop_table('appointments')
    op.drop_table('measurement_versions')
    op.drop_table('measurement_profiles')
    op.drop_table('branches')
    op.drop_table('users')
