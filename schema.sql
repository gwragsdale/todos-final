CREATE TABLE users (
	username text PRIMARY KEY,
	password text NOT NULL
);

CREATE TABLE todolists (
	id serial PRIMARY KEY,
	title text NOT NULL UNIQUE,
	username text 
		NOT NULL 
		REFERENCES users (username)
		ON DELETE CASCADE
);

CREATE TABLE todos (
	id serial PRIMARY KEY,
	title text NOT NULL,
	done BOOLEAN NOT NULL DEFAULT false,
	todolist_id int 
		NOT NULL
		REFERENCES todolists (id)
		ON DELETE CASCADE,
	username text
		NOT NULL
		REFERENCES users (username)
		ON DELETE CASCADE
);
