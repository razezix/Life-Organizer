from datetime import datetime, date
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel
from app.models.finance import AccountType, TxType, TxSource


class AccountCreate(BaseModel):
    name: str
    account_type: AccountType = AccountType.card
    currency: str = "RUB"
    balance: Decimal = Decimal(0)
    icon: Optional[str] = None


class AccountUpdate(BaseModel):
    name: Optional[str] = None
    balance: Optional[Decimal] = None
    icon: Optional[str] = None


class AccountOut(BaseModel):
    id: int
    name: str
    account_type: AccountType
    currency: str
    balance: Decimal
    icon: Optional[str]
    model_config = {"from_attributes": True}


class CategoryCreate(BaseModel):
    name: str
    icon: Optional[str] = None
    color: Optional[str] = None
    parent_id: Optional[int] = None


class CategoryOut(BaseModel):
    id: int
    name: str
    icon: Optional[str]
    color: Optional[str]
    parent_id: Optional[int]
    is_system: bool
    model_config = {"from_attributes": True}


class TransactionCreate(BaseModel):
    amount: Decimal
    type: TxType = TxType.expense
    transaction_date: date
    description: Optional[str] = None
    category_id: Optional[int] = None
    account_id: Optional[int] = None
    merchant_name: Optional[str] = None
    notes: Optional[str] = None


class TransactionUpdate(BaseModel):
    amount: Optional[Decimal] = None
    type: Optional[TxType] = None
    transaction_date: Optional[date] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    account_id: Optional[int] = None
    notes: Optional[str] = None


class TransactionOut(BaseModel):
    id: int
    amount: Decimal
    type: TxType
    transaction_date: date
    description: Optional[str]
    category_id: Optional[int]
    account_id: Optional[int]
    merchant_name: Optional[str]
    is_recurring: bool
    source: TxSource
    notes: Optional[str]
    created_at: datetime
    model_config = {"from_attributes": True}


class BudgetCreate(BaseModel):
    category_id: int
    amount: Decimal
    period: str = "monthly"


class BudgetOut(BaseModel):
    id: int
    category_id: int
    amount: Decimal
    period: str
    spent: Decimal = Decimal(0)
    model_config = {"from_attributes": True}


class SavingsGoalCreate(BaseModel):
    title: str
    target_amount: Decimal
    deadline: Optional[date] = None
    icon: Optional[str] = None


class SavingsGoalUpdate(BaseModel):
    title: Optional[str] = None
    target_amount: Optional[Decimal] = None
    current_amount: Optional[Decimal] = None
    deadline: Optional[date] = None


class SavingsGoalOut(BaseModel):
    id: int
    title: str
    target_amount: Decimal
    current_amount: Decimal
    deadline: Optional[date]
    icon: Optional[str]
    model_config = {"from_attributes": True}
