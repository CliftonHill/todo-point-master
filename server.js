/*
*****Todo Point Master, by Clifton Hill*****
cliftonhhill [@] gmail [dot] com / https://github.com/CliftonHill
*Full stack app made with Node, Express, MongoDB, Heroku Deployed, ejs Templating, password encryption (bcrypt). Create, edit, add and complete todo list, with points.
code is © 2020 by Clifton Hill
Read More Here: https://github.com/CliftonHill/todo-point-master/blob/master/README.md
Use it Here: https://guarded-reef-47099.herokuapp.com/


LEFT OFF ON:

*10/6/20 Note, changes made have been just to add readme and update notes, no programming changes, so github updated, but not heroku, which had a problem with last update, so avoid updating Heroku until there is time to investigate. Look at my OneRing notes for more details...I think.

*/
// *************************************************
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const app = express();
const bcrypt = require("bcrypt");
const saltRounds = 10;

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));

// MONGOOSE
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.PASSWORD}@cluster0-zc6ej.mongodb.net/todo-point-master?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

let db = mongoose.connection;
//***need to add in initial and ongoing connection error checks?

//Setup Schema
const todoSchema = new mongoose.Schema({
  userID: String,
  text: String,
  todoType: String,
  difficulty: Number,
  dateMade: String,
  dateMadeClientView: String,
  dateDue: String,
  dateDueClientView: String,
  completed: Boolean
});
const Todo = mongoose.model("Todo", todoSchema);

const userSchema = new mongoose.Schema({
  name: String, // which will be used to identify person on screen
  email: String, //which will be login id
  password: String
});
const User = mongoose.model("User", userSchema);

// Functionality
function convertDate(d){ //used here and in app.js, I could set up a separeate file to be a dependency and just refer to that for both js files
  let month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();
  if (month.length < 2) {
    month = "0" + month;
  }
  if (day.length < 2) {
    day = "0" + day;
  }
  return [year, month, day].join("-");
}

let inputSelection = "personal";
let radioSelection = "all"; // this value will be changed when add or update
let userName = "My";
let userID = "Not Logged In";

//ROUTING
app.get("/todos", function(req, res){
  let points = 0;
  Todo.find({userID: userID, completed: true}, function(err, todos){
    todos.forEach(function(todo){
      points+= todo.difficulty || 1; // or 1 is for all of the tasks that weren't given a point difficulty value
    });

    let personalSelection = "",
        workSelection = "";
    if (inputSelection === "personal"){
      personalSelection = "checked";
    } else {
      workSelection = "checked";
    }

    Todo.find({userID: userID, completed: false}, function(err, foundTodos){
      if (err) return err;

      res.render("todos", {
        todos: foundTodos, points: points, inputP: personalSelection, inputW: workSelection, userName: userName, userID: userID
      });
    });

  });
});

function adjustDueDate(date){ // adjusting hours, due date is reflecting as 5pm as of the day prior, advancing to 7pm of the correct day
  let dueDate = new Date(date);
  return new Date(dueDate.setHours(dueDate.getHours() + 26));
}

app.get("/", function(req, res){
  res.render("home", {loginProblem: "", regProblem: ""});
});

app.post("/login", function(req, res) {
  let data = req.body;
  let loginErrorMsg = "Username and/or password are incorrect. Try again.";
  User.find({email: data.email}, function(err, docs){ // verifies username is in database
    if (!err && docs.length === 1){
      userID = data.email;
      userName = docs[0].name;
      bcrypt.compare(data.password, docs[0].password, function(err, result){
        if (result && !err) {
          res.redirect("/todos"); // change to personal login i.e. /home route/Your Name
        } else {
          console.log("wrong password");
          res.render("home", {loginProblem: loginErrorMsg, regProblem: ""});
        }
      });

    } else {
      res.render("home", {loginProblem: loginErrorMsg, regProblem: ""});
    }
  })
});

app.post("/register", function(req, res) {
  let data = req.body;
  let regProblemMessage = "User ID (email) already exists, please re-enter correct email address or Log-In instead.";
  userName = data.name;
  userID = data.email;

  User.find({email: userID}, function(err, docs){
    if (docs.length > 0){ // then there is already a registration with that userID
      console.log("id already exists");
      res.render("home", {loginProblem: "", regProblem: regProblemMessage});
    } else {
      bcrypt.hash(data.password, saltRounds, function(err, hash){
        const user = new User({
          name: userName,
          email: userID,
          password: hash
        });

        user.save(function(err){
          if (!err) res.redirect("/todos"); // change to personal login i.e. /home route/Your Name
        });
      });
    }
  });
});

app.post("/todos/addTodo", function(req, res){ //this works to add to DB
  let data = req.body;
  inputSelection = data.todoTypeInput;
  if (data.newTodo.length > 3){
    const todo = new Todo({
        userID: userID,
        text: data.newTodo,
        todoType: data.todoTypeInput,
        difficulty: data.difficulty,
        dateMade: new Date(),
        dateMadeClientView: convertDate(new Date()),
        dateDue: adjustDueDate(data.todoDateDue),
        dateDueClientView: data.todoDateDue,
        completed: false
      });
      todo.save(function(err){
        if (!err) res.redirect("/todos");
      });
  }
});

app.post("/todos/updateTodo", function(req, res){
  let data = req.body;
  inputSelection = data.todoTypeInput;
  if (data.newTodo.length > 3){
    let update = {
      text: data.newTodo,
      todoType: data.todoTypeInput,
      difficulty: data.difficulty,
      dateDue: adjustDueDate(data.todoDateDue),
      dateDueClientView: data.todoDateDue
    }
    console.log(data);
      Todo.findOneAndUpdate({_id: data.taskId}, update, function(err, todo){
            if (err) console.log(err);
            else res.redirect("/todos");
      });
  }
});

app.post("/todos/finishTodo", function(req, res){
  Todo.findOneAndUpdate({_id: req.body.taskId},{completed: true}, function(err, todo){
    if (err) console.log(err);
    else res.redirect("/todos");
  });
});

let port = process.env.PORT; //heroku local uses port 5000
if (port == null || port == "") {
  console.log("working locally");
  port = 3000;
}

app.listen(port, function(){
  console.log("Server started");
});
