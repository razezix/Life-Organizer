"""user profile and password reset

Revision ID: 0002
Revises: 0001
Create Date: 2026-04-10
"""
from alembic import op
import sqlalchemy as sa

revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('users', sa.Column('display_name', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('timezone', sa.String(50), nullable=True, server_default='Europe/Moscow'))
    op.add_column('users', sa.Column('avatar_url', sa.String(500), nullable=True))
    op.add_column('users', sa.Column('password_reset_token', sa.String(255), nullable=True))
    op.add_column('users', sa.Column('password_reset_expires', sa.DateTime(timezone=True), nullable=True))
    op.add_column('users', sa.Column('email_notifications_enabled', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('users', sa.Column('daily_digest_enabled', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    op.drop_column('users', 'daily_digest_enabled')
    op.drop_column('users', 'email_notifications_enabled')
    op.drop_column('users', 'password_reset_expires')
    op.drop_column('users', 'password_reset_token')
    op.drop_column('users', 'avatar_url')
    op.drop_column('users', 'timezone')
    op.drop_column('users', 'display_name')
