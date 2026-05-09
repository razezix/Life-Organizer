"""finance and life planner tables

Revision ID: 0004
Revises: 0003
"""
from alembic import op
import sqlalchemy as sa

revision = '0004'
down_revision = '0003'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Finance: accounts
    op.create_table(
        'fin_accounts',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('account_type', sa.Enum('cash', 'card', 'deposit', 'credit', name='accounttype'),
                  nullable=False, server_default='card'),
        sa.Column('currency', sa.String(3), nullable=False, server_default='RUB'),
        sa.Column('balance', sa.Numeric(14, 2), nullable=False, server_default='0'),
        sa.Column('icon', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_fin_accounts_user_id', 'fin_accounts', ['user_id'])

    # Finance: categories
    op.create_table(
        'fin_categories',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('icon', sa.String(50), nullable=True),
        sa.Column('color', sa.String(20), nullable=True),
        sa.Column('parent_id', sa.Integer(), sa.ForeignKey('fin_categories.id', ondelete='SET NULL'), nullable=True),
        sa.Column('is_system', sa.Boolean(), nullable=False, server_default='false'),
    )
    op.create_index('ix_fin_categories_user_id', 'fin_categories', ['user_id'])

    # Finance: transactions
    op.create_table(
        'fin_transactions',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('account_id', sa.Integer(), sa.ForeignKey('fin_accounts.id', ondelete='SET NULL'), nullable=True),
        sa.Column('category_id', sa.Integer(), sa.ForeignKey('fin_categories.id', ondelete='SET NULL'), nullable=True),
        sa.Column('amount', sa.Numeric(14, 2), nullable=False),
        sa.Column('type', sa.Enum('income', 'expense', name='txtype'), nullable=False, server_default='expense'),
        sa.Column('transaction_date', sa.Date(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('merchant_name', sa.String(255), nullable=True),
        sa.Column('is_recurring', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('source', sa.Enum('manual', 'csv', 'one_c', name='txsource'), nullable=False, server_default='manual'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_fin_transactions_user_id', 'fin_transactions', ['user_id'])

    # Finance: budgets
    op.create_table(
        'fin_budgets',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('category_id', sa.Integer(), sa.ForeignKey('fin_categories.id', ondelete='CASCADE'), nullable=False),
        sa.Column('amount', sa.Numeric(14, 2), nullable=False),
        sa.Column('period', sa.String(20), nullable=False, server_default='monthly'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_fin_budgets_user_id', 'fin_budgets', ['user_id'])

    # Finance: savings goals
    op.create_table(
        'fin_savings_goals',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('target_amount', sa.Numeric(14, 2), nullable=False),
        sa.Column('current_amount', sa.Numeric(14, 2), nullable=False, server_default='0'),
        sa.Column('deadline', sa.Date(), nullable=True),
        sa.Column('icon', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_fin_savings_goals_user_id', 'fin_savings_goals', ['user_id'])

    # Pomodoro
    op.create_table(
        'pomodoro_sessions',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('task_id', sa.Integer(), sa.ForeignKey('tasks.id', ondelete='SET NULL'), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('duration_minutes', sa.Integer(), nullable=False, server_default='25'),
        sa.Column('type', sa.Enum('work', 'short_break', 'long_break', name='pomodorotype'),
                  nullable=False, server_default='work'),
        sa.Column('completed', sa.Boolean(), nullable=False, server_default='false'),
    )
    op.create_index('ix_pomodoro_sessions_user_id', 'pomodoro_sessions', ['user_id'])

    # Notes
    op.create_table(
        'notes',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('is_journal', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('mood', sa.Integer(), nullable=True),
        sa.Column('tags', sa.String(500), nullable=True),
        sa.Column('pinned', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_notes_user_id', 'notes', ['user_id'])

    # Health: water/sleep/exercise
    op.create_table(
        'water_logs',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('amount_ml', sa.Integer(), nullable=False),
        sa.Column('logged_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_water_logs_user_id', 'water_logs', ['user_id'])

    op.create_table(
        'sleep_logs',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('sleep_start', sa.DateTime(timezone=True), nullable=False),
        sa.Column('sleep_end', sa.DateTime(timezone=True), nullable=False),
        sa.Column('quality', sa.Integer(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
    )
    op.create_index('ix_sleep_logs_user_id', 'sleep_logs', ['user_id'])

    op.create_table(
        'exercise_logs',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('exercise_type', sa.String(100), nullable=False),
        sa.Column('duration_minutes', sa.Integer(), nullable=False),
        sa.Column('calories', sa.Integer(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('logged_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_exercise_logs_user_id', 'exercise_logs', ['user_id'])

    # Mood
    op.create_table(
        'mood_entries',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('mood', sa.Integer(), nullable=False),
        sa.Column('energy', sa.Integer(), nullable=True),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('tags', sa.String(500), nullable=True),
        sa.Column('logged_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_mood_entries_user_id', 'mood_entries', ['user_id'])

    # Seed system categories
    op.execute("""
        INSERT INTO fin_categories (name, icon, color, is_system) VALUES
        ('Продукты', '🛒', '#22c55e', true),
        ('Кафе/Рестораны', '🍔', '#f97316', true),
        ('Транспорт', '🚗', '#3b82f6', true),
        ('Жильё/ЖКХ', '🏠', '#8b5cf6', true),
        ('Одежда', '👕', '#ec4899', true),
        ('Здоровье', '⚕️', '#ef4444', true),
        ('Развлечения', '🎬', '#a855f7', true),
        ('Подписки', '📱', '#06b6d4', true),
        ('Образование', '📚', '#10b981', true),
        ('Подарки', '🎁', '#f59e0b', true),
        ('Переводы', '💸', '#6b7280', true),
        ('Зарплата', '💰', '#22c55e', true),
        ('Прочее', '📦', '#94a3b8', true)
    """)


def downgrade() -> None:
    op.drop_table('mood_entries')
    op.drop_table('exercise_logs')
    op.drop_table('sleep_logs')
    op.drop_table('water_logs')
    op.drop_table('notes')
    op.drop_table('pomodoro_sessions')
    op.execute('DROP TYPE IF EXISTS pomodorotype')
    op.drop_table('fin_savings_goals')
    op.drop_table('fin_budgets')
    op.drop_table('fin_transactions')
    op.execute('DROP TYPE IF EXISTS txsource')
    op.execute('DROP TYPE IF EXISTS txtype')
    op.drop_table('fin_categories')
    op.drop_table('fin_accounts')
    op.execute('DROP TYPE IF EXISTS accounttype')
