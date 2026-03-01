BEGIN;

CREATE TABLE users (
  user_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(255) NOT NULL
);

CREATE TABLE projects (
  project_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  budget NUMERIC(20,2) NOT NULL,
  deadline DATE NOT NULL,
  description VARCHAR(1000),
  status VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  customer_id BIGINT NOT NULL,
  CONSTRAINT fk_projects_customer
    FOREIGN KEY (customer_id) REFERENCES users(user_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE INDEX idx_projects_customer_id_deadline ON projects(customer_id, deadline, status);

CREATE TABLE payment_records (
  payment_record_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  amount NUMERIC(20,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  description TEXT,
  type VARCHAR(255) NOT NULL,
  project_id BIGINT NOT NULL,
  CONSTRAINT fk_payment_records_project
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE INDEX idx_payment_records_project_created_at ON payment_records(project_id, created_at DESC);

CREATE TABLE project_stages (
  project_stage_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  description TEXT,
  name VARCHAR(255) NOT NULL,
  order_index INTEGER NOT NULL,
  status VARCHAR(255) NOT NULL,
  project_id BIGINT NOT NULL,
  CONSTRAINT fk_project_stages_project
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE INDEX idx_project_stages_project_order ON project_stages(project_id, order_index);

CREATE TABLE teams (
  team_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(255) NOT NULL,
  project_id BIGINT NOT NULL,
  CONSTRAINT fk_teams_project
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE INDEX idx_teams_project_id ON teams(project_id);

CREATE TABLE tasks (
  task_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  description TEXT,
  status VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  assignee_id BIGINT,
  stage_id BIGINT NOT NULL,
  CONSTRAINT fk_tasks_assignee
    FOREIGN KEY (assignee_id) REFERENCES users(user_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_tasks_stage
    FOREIGN KEY (stage_id) REFERENCES project_stages(project_stage_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_stage_id ON tasks(stage_id);

CREATE TABLE team_members (
  team_member_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  role_in_team VARCHAR(255) NOT NULL,
  team_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  CONSTRAINT fk_team_members_team
    FOREIGN KEY (team_id) REFERENCES teams(team_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_team_members_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT uq_team_members_team_user UNIQUE (team_id, user_id)
);

CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);

COMMIT;
