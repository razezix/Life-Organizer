"""task scheduling and notifications

Revision ID: 0003
Revises: 0002
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '0003'
down_revision = '0002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enum types first (Postgres requires them to exist before ALTER TABLE)
    recurrence_enum = postgresql.ENUM('none', 'daily', 'weekly', 'monthly', name='recurrence')
    recurrence_enum.create(op.get_bind(), checkfirst=True)

    notif_enum = postgresql.ENUM('reminder', 'habit', 'goal', 'finance', 'system', name='notificationtype')
    notif_enum.create(op.get_bind(), checkfirst=True)

    # Task scheduling fields
    op.add_column('tasks', sa.Column('scheduled_date', sa.Date(), nullable=True))
    op.add_column('tasks', sa.Column('scheduled_time', sa.Time(), nullable=True))
    op.add_column('tasks', sa.Column('duration_minutes', sa.Integer(), nullable=True))
    op.add_column('tasks', sa.Column('reminder_minutes_before', sa.Integer(), nullable=True))
    op.add_column('tasks', sa.Column('recurrence',
        postgresql.ENUM('none', 'daily', 'weekly', 'monthly', name='recurrence', create_type=False),
        nullable=False, server_default='none'))

    # Notifications table
    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('body', sa.Text(), nullable=True),
        sa.Column('type', postgresql.ENUM('reminder', 'habit', 'goal', 'finance', 'system',
                                          name='notificationtype', create_type=False),
                  nullable=False, server_default='system'),
        sa.Column('read', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('link', sa.String(500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_notifications_user_id', 'notifications', ['user_id'])


def downgrade() -> None:
    op.drop_table('notifications')
    op.execute('DROP TYPE IF EXISTS notificationtype')
    op.drop_column('tasks', 'recurrence')
    op.execute('DROP TYPE IF EXISTS recurrence')
    op.drop_column('tasks', 'reminder_minutes_before')
    op.drop_column('tasks', 'duration_minutes')
    op.drop_column('tasks', 'scheduled_time')
    op.drop_column('tasks', 'scheduled_date')
