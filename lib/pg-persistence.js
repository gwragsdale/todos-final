const { dbQuery } = require("./db-query");
const bcrypt = require("bcrypt");

module.exports = class PgPersistence {
  constructor(session) {
    this.username = session.username;
  }

  isDoneTodoList(todoList) {
    return (
      todoList.todos.length > 0 && todoList.todos.every((todo) => todo.done)
    );
  }

  async authenticate(username, password) {
    const FIND_HASHED_PASSWORD =
      "SELECT password FROM users " + "WHERE username = $1";

    let result = await dbQuery(FIND_HASHED_PASSWORD, username);
    if (result.rowCount === 0) return false;

    return bcrypt.compare(password, result.rows[0].password);
  }

  hasUndoneTodos(todoList) {
    return todoList.todos.some((todo) => !todo.done);
  }

  async toggleDoneTodo(todoListId, todoId) {
    const TOGGLE_DONE =
      "UPDATE todos SET done = NOT done " +
      "WHERE todolist_id = $1 AND id = $2 AND username = $3";

    let result = await dbQuery(TOGGLE_DONE, todoListId, todoId, this.username);
    return result.rowCount > 0;
  }

  _partitionTodoLists(todoLists) {
    let undone = [];
    let done = [];

    todoLists.forEach((todoList) => {
      if (this.isDoneTodoList(todoList)) {
        done.push(todoList);
      } else {
        undone.push(todoList);
      }
    });

    return undone.concat(done);
  }

  async sortedTodoLists() {
    const ALL_TODOLISTS =
      "SELECT * FROM todolists " +
      "WHERE username = $1 " +
      "ORDER BY lower(title) ASC";
    const ALL_TODOS = "SELECT * FROM todos " + "WHERE username = $1";

    let resultTodoLists = dbQuery(ALL_TODOLISTS, this.username);
    let resultTodos = dbQuery(ALL_TODOS, this.username);
    let resultBoth = await Promise.all([resultTodoLists, resultTodos]);

    let allTodoLists = resultBoth[0].rows;
    let allTodos = resultBoth[1].rows;
    if (!allTodoLists || !allTodos) return undefined;

    allTodoLists.forEach((todoList) => {
      todoList.todos = allTodos.filter((todo) => {
        return todoList.id === todo.todolist_id;
      });
    });

    return this._partitionTodoLists(allTodoLists);
  }

  async sortedTodos(todoList) {
    const FIND_TODOS =
      "SELECT * FROM todos " +
      "WHERE todolist_id = $1 AND username = $2 " +
      "ORDER BY done ASC, lower(title) ASC";

    let result = await dbQuery(FIND_TODOS, todoList.id, this.username);
    return result.rows;
  }

  async loadTodoList(todoListId) {
    const FIND_TODOLIST =
      "SELECT * FROM todolists WHERE id = $1 AND username = $2";
    const FIND_TODOS =
      "SELECT * FROM todos WHERE todolist_id = $1 AND username = $2";

    let resultTodoList = dbQuery(FIND_TODOLIST, todoListId, this.username);
    let resultTodos = dbQuery(FIND_TODOS, todoListId, this.username);
    let resultBoth = await Promise.all([resultTodoList, resultTodos]);

    let todoList = resultBoth[0].rows[0];
    if (!todoList) return undefined;

    todoList.todos = resultBoth[1].rows;
    return todoList;
  }

  async loadTodo(todoListId, todoId) {
    const FIND_TODO =
      "SELECT * FROM todos " +
      "WHERE todolist_id = $1 AND id = $2 AND username = $3";

    let result = await dbQuery(FIND_TODO, todoListId, todoId, this.username);
    return result.rows[0];
  }
  //
  _selectTodoList(todoListId) {
    //    return this._todoLists.find(todoList => todoList.id === todoListId);
  }
  //
  _selectTodo(todoListId, todoId) {
    //    return this._selectTodoList(todoListId).todos.find(todo => todo.id === todoId);
  }
  //
  markDone(todoListId, todoId) {
    //    let todo = this._selectTodo(todoListId, todoId);
    //    todo.done = true;
  }
  //
  markUndone(todoListId, todoId) {
    //    let todo = this._selectTodo(todoListId, todoId);
    //    todo.done = false;
  }

  async deleteTodo(todoListId, todoId) {
    const DELETE_TODO =
      "DELETE FROM todos " +
      "WHERE todolist_id = $1 AND id = $2 AND username = $3";

    let result = await dbQuery(DELETE_TODO, todoListId, todoId, this.username);
    return result.rowCount > 0;
  }

  async completeAllTodos(todoListId) {
    const MARK_DONE =
      "UPDATE todos SET done = TRUE " +
      "WHERE todolist_id = $1 AND username = $2";

    let result = await dbQuery(MARK_DONE, todoListId, this.username);
    return result.rowCount > 0;
  }

  async createTodo(todoListId, title) {
    const CREATE_TODO =
      "INSERT INTO todos (title, todolist_id, username) " +
      "VALUES ($1, $2, $3)";

    let result = await dbQuery(CREATE_TODO, title, todoListId, this.username);
    return result.rowCount > 0;
  }

  async createTodoList(title) {
    const CREATE_LIST =
      "INSERT INTO todolists (title, username) VALUES ($1, $2)";

    try {
      let result = await dbQuery(CREATE_LIST, title, this.username);
      return result.rowCount > 0;
    } catch (error) {
      if (this.isUniqueConstraintViolation()) return false;
      throw error;
    }
  }

  async deleteTodoList(todoListId) {
    const DELETE_TODOLIST =
      "DELETE FROM todolists WHERE id = $1 AND username = $2";

    let result = await dbQuery(DELETE_TODOLIST, todoListId, this.username);
    return result.rowCount > 0;
  }

  async setTodoListTitle(todoListId, title) {
    const CHANGE_TITLE =
      "UPDATE todolists SET title = $1 " + "WHERE id = $2 AND username = $3";

    let result = await dbQuery(CHANGE_TITLE, title, todoListId, this.username);
    return result.rowCount > 0;
  }

  async existsTodoListTitle(title) {
    const TODO_TITLE =
      "SELECT * FROM todolists WHERE title = $1 AND username = $2";

    let result = await dbQuery(TODO_TITLE, title, this.username);
    return result.rowCount > 0;
  }

  isUniqueConstraintViolation(error) {
    return /duplicate key value violates unique constraint/.test(String(error));
  }
};
