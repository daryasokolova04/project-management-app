# Django Backend

Серверная часть приложения по управлению проектами

## Как запустить backend
Предварительно запустить БД из корня проекта: \
`docker compose up -d postgres` — поднимает PostgreSQL (`project_management`, пользователь `postgres/postgres`)

Затем из папки `/server`:
  1. Установить зависимости `pip install -r requirements.txt`
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
  - креды можно поменять через `.env` файл
- Через админку можно:
  - создавать и редактировать пользователей (`users_app.User`)
  - проверять роли (`role`) и доп. поля (`competencies`, `portfolio`)