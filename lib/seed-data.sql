INSERT INTO users (username, password)
  VALUES ('admin', '$2b$10$uC3lSZqheRZja2B.jBA8q.2s3hkEviwTuRWdw36tngJBkm1i/Llo6'),
         ('developer', '$2b$10$RIwuQnP.NKc1gJ5Ef08.dOSX8ibuEnDMziqJGr925nRM0LRhvCFN.'),
         ('somebody', 'knock-knock');

INSERT INTO todolists (title, username)
  VALUES ('Work Todos', 'admin'),
         ('Home Todos', 'admin'),
         ('Additional Todos', 'admin'),
         ('social todos', 'admin');

-- Note: in the following statement, get the todo list IDs from
-- the todolists table. If the todo list IDs are 1, 2, 3, and 4, then our code looks like this:
INSERT INTO todos (title, done, todolist_id, username)
  VALUES ('Get coffee', TRUE, 1, 'admin'),
         ('Chat with co-workers', TRUE, 1, 'admin'),
         ('Duck out of meeting', FALSE, 1, 'admin'),
         ('Feed the cats', TRUE, 2, 'admin'),
         ('Go to bed', TRUE, 2, 'admin'),
         ('Buy milk', TRUE, 2, 'admin'),
         ('Study for Launch School', TRUE, 2, 'admin'),
         ('Go to Libby''s birthday party', FALSE, 4, 'admin');
