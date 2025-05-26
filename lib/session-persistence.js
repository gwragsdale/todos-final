const SeedData = require("./seed-data");
const deepCopy = require("./deep-copy");
const { sortTodoLists, sortTodos } = require("./sort");
const nextId = require("./next-id");

module.exports = class SessionPersistence {
  constructor(session) {
    this._todoLists = session.todoLists || deepCopy(SeedData);
    this.username = session.username;
    session.todoLists = this._todoLists;
  }

  isUniqueConstraintViolation(_error) {
    return false;
  }

  isDoneTodoList(todoList) {
    return (
      todoList.todos.length > 0 && todoList.todos.every((todo) => todo.done)
    );
  }

  hasUndoneTodos(todoList) {
    return todoList.todos.some((todo) => !todo.done);
  }

  sortedTodoLists() {
    let todoLists = this._todoLists.filter(
      (list) => list.username === this.username,
    );
    todoLists = deepCopy(todoLists);
    let undone = todoLists.filter((todoList) => !this.isDoneTodoList(todoList));
    let done = todoLists.filter((todoList) => this.isDoneTodoList(todoList));
    return sortTodoLists(undone, done);
  }

  sortedTodos(todoList) {
    let todos = todoList.todos;
    let undone = todos.filter((todo) => !todo.done);
    let done = todos.filter((todo) => todo.done);
    return deepCopy(sortTodos(undone, done));
  }

  loadTodoList(todoListId) {
    let todoList = this._selectTodoList(todoListId);
    return deepCopy(todoList);
  }

  loadTodo(todoListId, todoId) {
    let todo = this._selectTodo(todoListId, todoId);
    return deepCopy(todo);
  }

  _selectTodoList(todoListId) {
    return this._todoLists.find((todoList) => todoList.id === todoListId);
  }

  _selectTodo(todoListId, todoId) {
    return this._selectTodoList(todoListId).todos.find(
      (todo) => todo.id === todoId,
    );
  }

  markDone(todoListId, todoId) {
    let todo = this._selectTodo(todoListId, todoId);
    todo.done = true;
  }

  markUndone(todoListId, todoId) {
    let todo = this._selectTodo(todoListId, todoId);
    todo.done = false;
  }

  removeAt(todoListId, todoId) {
    let todoList = this._selectTodoList(todoListId);
    if (!todoList) return false;

    let index = todoList.todos.findIndex((todo) => todo.id === todoId);
    if (index === -1) return false;

    todoList.todos.splice(index, 1);
    return true;
  }

  markAllDone(todoListId) {
    let todoList = this._selectTodoList(todoListId);
    if (!todoList) return false;
    todoList.todos.forEach((todo) => (todo.done = true));
    return true;
  }

  add(todoListId, todoTitle) {
    let todoList = this._selectTodoList(todoListId);
    if (!todoList) return false;

    let newTodo = {
      id: nextId(),
      title: todoTitle,
      done: false,
    };

    todoList.todos.push(newTodo);
    return true;
  }

  createTodoList(title) {
    this._todoLists.push({
      title,
      id: nextId(),
      todos: [],
    });

    return true;
  }

  deleteTodoList(todoListId) {
    let index = this._todoLists.findIndex(
      (todoList) => todoList.id === todoListId,
    );
    if (index === -1) return false;
    this._todoLists.splice(index, 1);
    return true;
  }

  changeTitle(newTitle, todoListId) {
    let todoList = this._selectTodoList(todoListId);
    if (!todoList) return false;
    todoList.title = newTitle;
    return true;
  }

  existsTodoListTitle(title) {
    return this._todoLists.some((todoList) => todoList.title === title);
  }
};
