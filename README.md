# Project Management App

Клиент-серверное приложение для управления проектами.

## Стек
- Backend: Django + DRF + PostgreSQL
- Frontend: React + TypeScript + Bootstrap

## Структура
- `/server` - backend
- `/client` - frontend
- `/database` - SQL схемы

## Как запустить
- Из корня `docker compose up -d`
- Из папки `/server`:
    1. `python manage.py migrate`
    2. `python manage.py createsuperuser`, если нужен доступ к админке
    3. `python manage.py runserver`