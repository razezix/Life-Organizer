from datetime import date
from decimal import Decimal
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.core.pagination import PaginationParams, PaginatedResponse
from app.dependencies import get_current_user
from app.models.finance import Account, ExpenseCategory, Transaction, Budget, SavingsGoal, TxType
from app.models.user import User
from app.schemas.finance import (
    AccountCreate, AccountUpdate, AccountOut,
    CategoryCreate, CategoryOut,
    TransactionCreate, TransactionUpdate, TransactionOut,
    BudgetCreate, BudgetOut,
    SavingsGoalCreate, SavingsGoalUpdate, SavingsGoalOut,
)

router = APIRouter(prefix="/finance", tags=["finance"])


# Accounts
@router.get("/accounts", response_model=list[AccountOut])
def list_accounts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Account).filter(Account.user_id == current_user.id).all()


@router.post("/accounts", response_model=AccountOut, status_code=201)
def create_account(body: AccountCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    a = Account(user_id=current_user.id, **body.model_dump())
    db.add(a); db.commit(); db.refresh(a)
    return a


@router.put("/accounts/{account_id}", response_model=AccountOut)
def update_account(account_id: int, body: AccountUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    a = db.query(Account).filter(Account.id == account_id, Account.user_id == current_user.id).first()
    if not a: raise HTTPException(404, "Account not found")
    for k, v in body.model_dump(exclude_unset=True).items(): setattr(a, k, v)
    db.commit(); db.refresh(a)
    return a


@router.delete("/accounts/{account_id}", status_code=204)
def delete_account(account_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    a = db.query(Account).filter(Account.id == account_id, Account.user_id == current_user.id).first()
    if not a: raise HTTPException(404, "Account not found")
    db.delete(a); db.commit()


# Categories
@router.get("/categories", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(ExpenseCategory).filter(
        or_(ExpenseCategory.user_id == current_user.id, ExpenseCategory.is_system == True)
    ).all()


@router.post("/categories", response_model=CategoryOut, status_code=201)
def create_category(body: CategoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    c = ExpenseCategory(user_id=current_user.id, is_system=False, **body.model_dump())
    db.add(c); db.commit(); db.refresh(c)
    return c


# Transactions
@router.get("/transactions", response_model=PaginatedResponse[TransactionOut])
def list_transactions(
    type: Optional[TxType] = None,
    category_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    pagination: PaginationParams = Depends(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    if type: q = q.filter(Transaction.type == type)
    if category_id: q = q.filter(Transaction.category_id == category_id)
    if date_from: q = q.filter(Transaction.transaction_date >= date_from)
    if date_to: q = q.filter(Transaction.transaction_date <= date_to)
    total = q.count()
    items = q.order_by(Transaction.transaction_date.desc(), Transaction.id.desc()).offset(pagination.skip).limit(pagination.limit).all()
    return PaginatedResponse(items=items, total=total, skip=pagination.skip, limit=pagination.limit)


@router.post("/transactions", response_model=TransactionOut, status_code=201)
def create_transaction(body: TransactionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    t = Transaction(user_id=current_user.id, **body.model_dump())
    db.add(t)
    # Update account balance
    if body.account_id:
        acc = db.query(Account).filter(Account.id == body.account_id, Account.user_id == current_user.id).first()
        if acc:
            delta = body.amount if body.type == TxType.income else -body.amount
            acc.balance = (acc.balance or Decimal(0)) + delta
    db.commit(); db.refresh(t)
    return t


@router.put("/transactions/{tx_id}", response_model=TransactionOut)
def update_transaction(tx_id: int, body: TransactionUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    t = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.user_id == current_user.id).first()
    if not t: raise HTTPException(404, "Transaction not found")
    for k, v in body.model_dump(exclude_unset=True).items(): setattr(t, k, v)
    db.commit(); db.refresh(t)
    return t


@router.delete("/transactions/{tx_id}", status_code=204)
def delete_transaction(tx_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    t = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.user_id == current_user.id).first()
    if not t: raise HTTPException(404, "Transaction not found")
    db.delete(t); db.commit()


# Budgets
@router.get("/budgets", response_model=list[BudgetOut])
def list_budgets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from sqlalchemy import func
    from datetime import datetime
    today = date.today()
    month_start = today.replace(day=1)
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    result = []
    for b in budgets:
        spent = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
            Transaction.user_id == current_user.id,
            Transaction.category_id == b.category_id,
            Transaction.type == TxType.expense,
            Transaction.transaction_date >= month_start,
        ).scalar()
        result.append(BudgetOut(
            id=b.id, category_id=b.category_id, amount=b.amount, period=b.period,
            spent=Decimal(str(spent)),
        ))
    return result


@router.post("/budgets", response_model=BudgetOut, status_code=201)
def create_budget(body: BudgetCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    b = Budget(user_id=current_user.id, **body.model_dump())
    db.add(b); db.commit(); db.refresh(b)
    return BudgetOut(id=b.id, category_id=b.category_id, amount=b.amount, period=b.period)


@router.delete("/budgets/{budget_id}", status_code=204)
def delete_budget(budget_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    b = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not b: raise HTTPException(404, "Budget not found")
    db.delete(b); db.commit()


# Savings goals
@router.get("/savings", response_model=list[SavingsGoalOut])
def list_savings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(SavingsGoal).filter(SavingsGoal.user_id == current_user.id).all()


@router.post("/savings", response_model=SavingsGoalOut, status_code=201)
def create_savings(body: SavingsGoalCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    g = SavingsGoal(user_id=current_user.id, **body.model_dump())
    db.add(g); db.commit(); db.refresh(g)
    return g


@router.put("/savings/{goal_id}", response_model=SavingsGoalOut)
def update_savings(goal_id: int, body: SavingsGoalUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    g = db.query(SavingsGoal).filter(SavingsGoal.id == goal_id, SavingsGoal.user_id == current_user.id).first()
    if not g: raise HTTPException(404, "Goal not found")
    for k, v in body.model_dump(exclude_unset=True).items(): setattr(g, k, v)
    db.commit(); db.refresh(g)
    return g


@router.delete("/savings/{goal_id}", status_code=204)
def delete_savings(goal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    g = db.query(SavingsGoal).filter(SavingsGoal.id == goal_id, SavingsGoal.user_id == current_user.id).first()
    if not g: raise HTTPException(404, "Goal not found")
    db.delete(g); db.commit()
