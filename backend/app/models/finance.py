from datetime import datetime, date, timezone
from typing import Optional
import enum

from sqlalchemy import String, Text, DateTime, Date, Numeric, ForeignKey, Enum, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from decimal import Decimal

from app.core.database import Base


class AccountType(str, enum.Enum):
    cash = "cash"
    card = "card"
    deposit = "deposit"
    credit = "credit"


class TxType(str, enum.Enum):
    income = "income"
    expense = "expense"


class TxSource(str, enum.Enum):
    manual = "manual"
    csv = "csv"
    one_c = "one_c"


class Account(Base):
    __tablename__ = "fin_accounts"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(100))
    account_type: Mapped[AccountType] = mapped_column(Enum(AccountType), default=AccountType.card)
    currency: Mapped[str] = mapped_column(String(3), default="RUB")
    balance: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    icon: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class ExpenseCategory(Base):
    __tablename__ = "fin_categories"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    icon: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    color: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    parent_id: Mapped[Optional[int]] = mapped_column(ForeignKey("fin_categories.id", ondelete="SET NULL"), nullable=True)
    is_system: Mapped[bool] = mapped_column(Boolean, default=False)


class Transaction(Base):
    __tablename__ = "fin_transactions"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    account_id: Mapped[Optional[int]] = mapped_column(ForeignKey("fin_accounts.id", ondelete="SET NULL"), nullable=True)
    category_id: Mapped[Optional[int]] = mapped_column(ForeignKey("fin_categories.id", ondelete="SET NULL"), nullable=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    type: Mapped[TxType] = mapped_column(Enum(TxType), default=TxType.expense)
    transaction_date: Mapped[date] = mapped_column(Date)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    merchant_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_recurring: Mapped[bool] = mapped_column(Boolean, default=False)
    source: Mapped[TxSource] = mapped_column(Enum(TxSource), default=TxSource.manual)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Budget(Base):
    __tablename__ = "fin_budgets"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("fin_categories.id", ondelete="CASCADE"))
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    period: Mapped[str] = mapped_column(String(20), default="monthly")  # monthly/weekly
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class SavingsGoal(Base):
    __tablename__ = "fin_savings_goals"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    target_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    current_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    deadline: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    icon: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
