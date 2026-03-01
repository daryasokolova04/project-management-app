BEGIN;

INSERT INTO users (email, name, password_hash, role) VALUES
  ('alice.pm@example.com', 'Alice Product Manager', '$2b$10$alice.hash.placeholder', 'FREELANCER'),
  ('bob.dev@example.com', 'Bob Developer', '$2b$10$bob.hash.placeholder', 'CUSTOMER'),
  ('carol.qa@example.com', 'Carol QA', '$2b$10$carol.hash.placeholder', 'FREELANCER'),
  ('dan.client@example.com', 'Dan Client', '$2b$10$dan.hash.placeholder', 'ADMIN');

INSERT INTO projects (budget, deadline, description, status, title, customer_id)
SELECT
  120000.00,
  DATE '2026-08-31',
  'Internal platform upgrade and process automation.',
  'DRAFT',
  'Platform Revamp',
  u.user_id
FROM users u
WHERE u.email = 'dan.client@example.com';

INSERT INTO project_stages (description, name, order_index, status, project_id)
SELECT 'Initial backlog and requirements', 'Backlog', 1, 'PENDING', p.project_id
FROM projects p
WHERE p.title = 'Platform Revamp'
UNION ALL
SELECT 'Development in progress', 'Development', 2, 'PENDING', p.project_id
FROM projects p
WHERE p.title = 'Platform Revamp'
UNION ALL
SELECT 'Verification and release checks', 'QA', 3, 'PENDING', p.project_id
FROM projects p
WHERE p.title = 'Platform Revamp';

INSERT INTO teams (name, project_id)
SELECT 'Core Delivery Team', p.project_id
FROM projects p
WHERE p.title = 'Platform Revamp';

INSERT INTO team_members (role_in_team, team_id, user_id)
SELECT 'lead', t.team_id, u.user_id
FROM teams t
JOIN users u ON u.email = 'alice.pm@example.com'
WHERE t.name = 'Core Delivery Team'
UNION ALL
SELECT 'developer', t.team_id, u.user_id
FROM teams t
JOIN users u ON u.email = 'bob.dev@example.com'
WHERE t.name = 'Core Delivery Team'
UNION ALL
SELECT 'qa', t.team_id, u.user_id
FROM teams t
JOIN users u ON u.email = 'carol.qa@example.com'
WHERE t.name = 'Core Delivery Team';

INSERT INTO tasks (description, status, title, assignee_id, stage_id)
SELECT
  'Design REST API for project and task management',
  'OPEN',
  'API Design',
  u.user_id,
  s.project_stage_id
FROM users u
JOIN project_stages s ON s.name = 'Development'
JOIN projects p ON p.project_id = s.project_id
WHERE u.email = 'bob.dev@example.com'
  AND p.title = 'Platform Revamp'
UNION ALL
SELECT
  'Prepare regression test checklist for sprint release',
  'OPEN',
  'Regression Checklist',
  u.user_id,
  s.project_stage_id
FROM users u
JOIN project_stages s ON s.name = 'QA'
JOIN projects p ON p.project_id = s.project_id
WHERE u.email = 'carol.qa@example.com'
  AND p.title = 'Platform Revamp';

INSERT INTO payment_records (amount, created_at, description, type, project_id)
SELECT
  25000.00,
  NOW() - INTERVAL '20 days',
  'Kickoff payment',
  'PAYMENT',
  p.project_id
FROM projects p
WHERE p.title = 'Platform Revamp'
UNION ALL
SELECT
  15000.00,
  NOW() - INTERVAL '5 days',
  'Infrastructure and tooling costs',
  'BUDGET',
  p.project_id
FROM projects p
WHERE p.title = 'Platform Revamp';

COMMIT;
