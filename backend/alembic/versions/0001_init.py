"""init

Revision ID: 0001
Revises:
Create Date: 2026-04-06 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_users_email', 'users', ['email'])

    op.create_table(
        'tasks',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('due_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('priority', sa.Enum('low', 'medium', 'high', name='priority'), nullable=False, server_default='medium'),
        sa.Column('status', sa.Enum('todo', 'done', name='taskstatus'), nullable=False, server_default='todo'),
        sa.Column('category', sa.String(100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_tasks_user_id', 'tasks', ['user_id'])

    op.create_table(
        'habits',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('frequency', sa.Enum('daily', 'weekly', name='frequency'), nullable=False, server_default='daily'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_habits_user_id', 'habits', ['user_id'])

    op.create_table(
        'habit_logs',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('habit_id', sa.Integer(), sa.ForeignKey('habits.id', ondelete='CASCADE'), nullable=False),
        sa.Column('log_date', sa.Date(), nullable=False),
        sa.Column('completed', sa.Boolean(), nullable=False, server_default='true'),
    )
    op.create_index('ix_habit_logs_habit_id', 'habit_logs', ['habit_id'])

    op.create_table(
        'goals',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('target_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('progress', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('status', sa.Enum('active', 'completed', 'abandoned', name='goalstatus'), nullable=False, server_default='active'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_goals_user_id', 'goals', ['user_id'])

    op.create_table(
        'goal_milestones',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('goal_id', sa.Integer(), sa.ForeignKey('goals.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('completed', sa.Boolean(), nullable=False, server_default='false'),
    )
    op.create_index('ix_goal_milestones_goal_id', 'goal_milestones', ['goal_id'])


def downgrade() -> None:
    op.drop_table('goal_milestones')
    op.drop_table('goals')
    op.drop_table('habit_logs')
    op.drop_table('habits')
    op.drop_table('tasks')
    op.drop_table('users')
    op.execute('DROP TYPE IF EXISTS priority')
    op.execute('DROP TYPE IF EXISTS taskstatus')
    op.execute('DROP TYPE IF EXISTS frequency')
    op.execute('DROP TYPE IF EXISTS goalstatus')
