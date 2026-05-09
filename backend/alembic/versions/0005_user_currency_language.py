"""user currency and language

Revision ID: 0005
Revises: 0004
"""
from alembic import op
import sqlalchemy as sa

revision = '0005'
down_revision = '0004'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('users', sa.Column('currency', sa.String(3), nullable=True, server_default='KZT'))
    op.add_column('users', sa.Column('language', sa.String(2), nullable=True, server_default='en'))


def downgrade() -> None:
    op.drop_column('users', 'language')
    op.drop_column('users', 'currency')
