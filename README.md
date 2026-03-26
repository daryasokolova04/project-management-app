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

## Модуль команд и задач
### Команды
- **Модели**: Team (команда проекта), TeamMember (участник команды с ролью)
- **Роли в команде**: DEVELOPER (разработчик), TESTER (тестировщик), LEAD (тимлид)
- **Ограничения**: уникальная связь team+user (один пользователь не может быть добавлен в одну команду дважды)

**Основные эндпоинты** (требуют аутентификации):
- `GET /api/teams/teams/?project_id=...` - список команд проекта
- `POST /api/teams/teams/` - создание новой команды
- `POST /api/teams/teams/{id}/members/` - добавление участника в команду
- `DELETE /api/teams/teams/{id}/members/{user_id}/` - удаление участника из команды

### Задачи
- **Модель**: Task (задача этапа проекта)
- **Статусы**: OPEN (открыта), IN_PROGRESS (в работе), DONE (выполнена)

**Основные эндпоинты** (вложены в этапы проекта):
- `GET /api/stages/{stage_id}/tasks/` - список задач этапа (с фильтрацией по assignee и status)
- `POST /api/stages/{stage_id}/tasks/` - создание новой задачи
- `PATCH /api/stages/{stage_id}/tasks/{id}/take/` - взять задачу в работу
- `PATCH /api/stages/{stage_id}/tasks/{id}/complete/` - завершить задачу

### Django admin
- URL админки: `/admin/`
- Для локальной разработки создан дефолтный суперпользователь:
  - username: `admin`
  - password: `adminpass`
  - email: `admin@example.com`
- Через админку можно:
  - создавать и редактировать пользователей (`users_app.User`)
  - проверять роли (`role`) и доп. поля (`competencies`, `portfolio`)

### Swagger UI
Ознакомиться с API бэкенда и протестировать его можно через интерфейс Swagger \
Доступен на ручке `/api/docs/`

## Как запустить приложение
Из корня проекта: `docker compose up -d` \
Поднимает 
- PostgreSQL (`project_management`, пользователь `postgres/postgres`)
- Django app
- Client app (3000 порт)
