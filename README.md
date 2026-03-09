# Project Management App

Клиент-серверное приложение для управления проектами.

## Стек
- Backend: Django + DRF + PostgreSQL
- Frontend: React + TypeScript + Bootstrap

## Структура
- `/server` - backend
- `/client` - frontend
- `/database` - SQL схемы

## Как запустить приложение
Из корня проекта: `docker compose up -d` \
Поднимает 
- PostgreSQL (`project_management`, пользователь `postgres/postgres`)
- Django app

Фронт запускается отдельно \
_TODO: запаковать в контейнер и добавить в compose_
