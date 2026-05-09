from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.routers import auth, tasks, habits, goals, dashboard, notifications, calendar, finance, finance_analytics, pomodoro, notes, health, mood, reviews, insights

limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

app = FastAPI(title="Life Organizer API", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(habits.router)
app.include_router(goals.router)
app.include_router(dashboard.router)
app.include_router(notifications.router)
app.include_router(calendar.router)
app.include_router(finance.router)
app.include_router(finance_analytics.router)
app.include_router(pomodoro.router)
app.include_router(notes.router)
app.include_router(health.router)
app.include_router(mood.router)
app.include_router(reviews.router)
app.include_router(insights.router)


@app.get("/health")
def health():
    return {"status": "ok"}
