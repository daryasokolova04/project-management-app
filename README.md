# Project Management App

Клиент-серверное приложение для управления проектами.

## Стек
- Backend: Django + DRF + PostgreSQL
- Frontend: React + TypeScript + Bootstrap

## Структура
- `/server` - backend
- `/client` - frontend
- `/database` - SQL схемы

## Как запустить backend

- Из корня проекта:
  - `docker compose up -d` — поднимает PostgreSQL (`project_management`, пользователь `postgres/postgres`)
- Из папки `/server`:
  1. Активировать виртуальное окружение (если ещё не активно): `source venv/bin/activate`
  2. Применить миграции: `python manage.py migrate`
  3. (Опционально) создать суперпользователя: `python manage.py createsuperuser`
  4. Запустить сервер: `python manage.py runserver 0.0.0.0:8000`

### Модуль пользователей и аутентификации
- Кастомная модель пользователя: `users_app.User` (расширяет `AbstractUser`)
  - Доп. поля: `role` (`CUSTOMER`, `FREELANCER`, `ADMIN`), `competencies`, `portfolio`, `email` (уникальный)
- Основные эндпоинты (DRF + token auth):
  - `POST /api/users/register/` — регистрация, возвращает токен и данные пользователя
  - `POST /api/users/login/` — вход по `email` и `password`, возвращает токен и данные пользователя
  - `GET /api/users/me/` — профиль текущего пользователя (нужен заголовок `Authorization: Token <token>`)
  - `GET /api/users/` — список пользователей, доступен только ADMIN

### Django admin
- URL админки: `/admin/`
- Для локальной разработки создан дефолтный суперпользователь:
  - username: `admin`
  - password: `adminpass`
  - email: `admin@example.com`
- Через админку можно:
  - создавать и редактировать пользователей (`users_app.User`)
  - проверять роли (`role`) и доп. поля (`competencies`, `portfolio`)