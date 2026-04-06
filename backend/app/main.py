from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, tasks, habits, goals, dashboard

app = FastAPI(title="Life Organizer API", version="1.0.0")

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


@app.get("/health")
def health():
    return {"status": "ok"}
