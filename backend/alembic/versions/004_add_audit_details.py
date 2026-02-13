"""add details column to audit_logs

Revision ID: 2defg3456789
Revises: 7da36be58520
Create Date: 2026-02-13 16:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2defg3456789'
down_revision = '7da36be58520'
branch_labels = None
depends_on = None


def upgrade():
    # Add details column to audit_logs table if it doesn't exist
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = inspector.get_columns('audit_logs')
    column_names = [c["name"] for c in columns]
    
    if 'details' not in column_names:
        op.add_column('audit_logs', sa.Column('details', sa.JSON(), nullable=True))


def downgrade():
    op.drop_column('audit_logs', 'details')
