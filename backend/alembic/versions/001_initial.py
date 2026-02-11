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
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    # Create users table
    if 'users' not in tables:
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
    
    if 'users' in tables or 'users' in inspector.get_table_names():
        users_indexes = [idx['name'] for idx in inspector.get_indexes('users')]
        if 'ix_users_email' not in users_indexes:
            op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
        if 'ix_users_phone' not in users_indexes:
            op.create_index(op.f('ix_users_phone'), 'users', ['phone'], unique=False)

    # Create branches table
    if 'branches' not in tables:
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
    if 'measurement_profiles' not in tables:
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
    
    if 'measurement_profiles' in tables or 'measurement_profiles' in inspector.get_table_names():
        mp_indexes = [idx['name'] for idx in inspector.get_indexes('measurement_profiles')]
        if 'ix_measurement_profiles_user_id' not in mp_indexes:
            op.create_index(op.f('ix_measurement_profiles_user_id'), 'measurement_profiles', ['user_id'], unique=False)

    # Create measurement_versions table
    if 'measurement_versions' not in tables:
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
    
    if 'measurement_versions' in tables or 'measurement_versions' in inspector.get_table_names():
        mv_indexes = [idx['name'] for idx in inspector.get_indexes('measurement_versions')]
        if 'ix_measurement_versions_profile_id' not in mv_indexes:
            op.create_index(op.f('ix_measurement_versions_profile_id'), 'measurement_versions', ['profile_id'], unique=False)

    # Create appointments table
    if 'appointments' not in tables:
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
    
    if 'appointments' in tables or 'appointments' in inspector.get_table_names():
        app_indexes = [idx['name'] for idx in inspector.get_indexes('appointments')]
        if 'ix_appointments_customer_id' not in app_indexes:
            op.create_index(op.f('ix_appointments_customer_id'), 'appointments', ['customer_id'], unique=False)
        if 'ix_appointments_scheduled_time' not in app_indexes:
            op.create_index(op.f('ix_appointments_scheduled_time'), 'appointments', ['scheduled_time'], unique=False)
        if 'ix_appointments_status' not in app_indexes:
            op.create_index(op.f('ix_appointments_status'), 'appointments', ['status'], unique=False)

    # Create tailor_availability table
    if 'tailor_availability' not in tables:
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
