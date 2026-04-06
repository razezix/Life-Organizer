#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."
until python -c "
import psycopg2, os
psycopg2.connect(os.environ['DATABASE_URL'])
" 2>/dev/null; do
  sleep 1
done
echo "PostgreSQL is ready."

echo "Running migrations..."
alembic upgrade head

echo "Starting server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
