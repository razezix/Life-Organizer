# Life Organizer

A full-stack personal life management web app — tasks, habits, goals, finance, health, mood, notes, and Pomodoro timer. Bilingual (EN/RU), multi-currency, and Docker-ready.

---

## Features

- **Tasks** — create, schedule, set reminders and recurrence (daily/weekly/monthly)
- **Habits** — daily/weekly tracking with streaks
- **Goals** — multi-step goals with progress tracking
- **Calendar** — unified view of tasks, habits, and goals
- **Finance** — accounts, transactions, budgets, CSV/1C import, spending analytics
- **Health** — water intake, sleep records, exercise log
- **Mood** — 5-level emoji tracker with energy scale and 30-day heatmap
- **Notes & Journal** — Markdown notes, pinning, mood tagging, full-text search
- **Pomodoro** — 25/5/15 timer with weekly stats
- **Dashboard** — overview of all modules with AI insights widget
- **Notifications** — in-app notification center with unread badge
- **Auth** — JWT (access + refresh), password reset via email, profile settings
- **i18n** — English / Russian UI, KZT / USD / EUR / RUB currency, world timezones

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, SQLAlchemy 2.0, Alembic, PostgreSQL |
| Auth | JWT (python-jose), bcrypt |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| State | Zustand |
| Charts | Recharts |
| Calendar | FullCalendar |
| Infra | Docker Compose |

## Quick Start

```bash
git clone https://github.com/razezix/Life-Organizer.git
cd Life-Organizer

# Copy and fill in secrets
cp backend/.env.example backend/.env

# Start everything
docker-compose up --build
```

- Frontend: http://localhost:5173  
- Backend API docs: http://localhost:8000/docs

## Environment Variables

See `backend/.env.example`. Required vars:

```
DATABASE_URL=postgresql://user:password@db:5432/lifeorganizer
SECRET_KEY=<random-64-char-string>
SMTP_HOST=smtp.gmail.com
SMTP_USER=you@gmail.com
SMTP_PASS=your-app-password
```

---

---

# Life Organizer (на русском)

Полнофункциональный веб-планировщик жизни — задачи, привычки, цели, финансы, здоровье, настроение, заметки и помодоро-таймер. Двуязычный (EN/RU), мультивалютный, запускается через Docker.

---

## Возможности

- **Задачи** — создание, расписание, напоминания, повторения (ежедневно / еженедельно / ежемесячно)
- **Привычки** — трекинг с подсчётом серий (streaks)
- **Цели** — многошаговые цели с прогресс-баром
- **Календарь** — единый вид задач, привычек и целей
- **Финансы** — счета, транзакции, бюджеты, импорт CSV / 1С, аналитика расходов
- **Здоровье** — учёт воды, сна, тренировок
- **Настроение** — шкала 1–5 (emoji), уровень энергии, тепловая карта за 30 дней
- **Заметки и дневник** — Markdown, закрепление, тег настроения, полнотекстовый поиск
- **Помодоро** — таймер 25/5/15 мин с недельной статистикой
- **Дашборд** — обзор всех модулей и виджет AI-инсайтов
- **Уведомления** — центр уведомлений с индикатором непрочитанных
- **Авторизация** — JWT (access + refresh токены), сброс пароля по email, страница профиля
- **Локализация** — интерфейс на EN/RU, валюты KZT / USD / EUR / RUB, мировые часовые пояса

## Технологический стек

| Слой | Технология |
|------|-----------|
| Backend | FastAPI, SQLAlchemy 2.0, Alembic, PostgreSQL |
| Авторизация | JWT (python-jose), bcrypt |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| State | Zustand |
| Графики | Recharts |
| Календарь | FullCalendar |
| Инфраструктура | Docker Compose |

## Быстрый старт

```bash
git clone https://github.com/razezix/Life-Organizer.git
cd Life-Organizer

# Скопируй и заполни переменные окружения
cp backend/.env.example backend/.env

# Запусти всё
docker-compose up --build
```

- Фронтенд: http://localhost:5173  
- Документация API: http://localhost:8000/docs

## Переменные окружения

Смотри `backend/.env.example`. Обязательные:

```
DATABASE_URL=postgresql://user:password@db:5432/lifeorganizer
SECRET_KEY=<случайная-строка-64-символа>
SMTP_HOST=smtp.gmail.com
SMTP_USER=you@gmail.com
SMTP_PASS=your-app-password
```
