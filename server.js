/* TODO APP: Create, edit, add and complete todo list. Inspired by Modern JS Bootcamp (on Udemy), code by Clifton Hill.

FEATURES:
-Create a task that is either "work" or "personal", radio selection sticks for continued input in same category
-Edit, delete and complete task.
-creates "Add Date" of task, as well as Due date that is editable
-border of task changes to yellow if due that day, red if overdue.
-tracks points for tasks completed, based on difficulty
-tracks how many tasks remain
-MongoDB connected for persistent data
-sort by category (all/personal/work) or filter tasks by typed entry.

PROGRAMMER NOTES:
-sort/filter is done entirely client side to avoid an unneeded DB access.
-some dynamic searches for correct childNode set up to avoid program breaking if order of Nodes or length changes

BUGS FIXED:
-date display issues - reflected time in milliseconds
-only show "Date Due" if not "Invalid Date"
-adjusted stored date values so that due date highlights are more accurate
-difficulty level not filling in edit field from task because other errors were stopping code execution, once I fixed those (wrong childNodes selections) it worked just fine
-replaced *editing* button value back to "edit" if another edit button is clicked instead

LEFT OFF ON:
**user login

FUTURE:
*needed*
-upload to Heroku
-setup a personal login
-use bootstrap to modernize appearance, make sure mobile works

*other*
-add stylesheet classes to use for emphasis and color changes to greater differentiate tasks - make a pastel choice of colors so that text is still visible
-will need diff Doc categories such as Points for the point tracker and Users for the various users. The users will be the top level, then points nad tasks subordinate
-store points in mongodb. Running tally of points at top for total, and for each week/day. Urgent tasks don't get extra points, this shows a lack of planning - usually and is not rewarded.
-generate a chart that shows progress of task points earned over time to see productivity.
-make it searchable by type of difficulty, or date due
-if input category and category tabs match, then keep them there, so you can work within Personal or Work tabs without having to switch back and forth.
-sort drop down (option tags enclosed by select tag), next to filter input to sort by: date created (default) - oldest at top, newest at bottom, due soon (yellow items, w/ red at bottom, then rest), overdue (red items), other? Maybe also a sort for colored items?
*can i also include routing, so that I can have the url something like clifton.todos.com?
-finish setting up dynamically searched childNodes to avoid program break; some already complete


*/
// *************************************************

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));

// MONGOOSE
mongoose.connect("mongodb://localhost:27017/todo-point-masterDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

let db = mongoose.connection;
//***need to add in initial and ongoing connection error checks?

//Setup Schema
const todoSchema = new mongoose.Schema({
  user: String,
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

//ROUTING
app.get("/", function(req, res){
  let points = 0;
  let userName = "My";
  Todo.find({completed: true}, function(err, todos){
    todos.forEach(function(todo){
      points+= todo.difficulty || 1; // or 1 is for all of the tasks that weren't given a point difficulty value
    });
  });

  let personalSelection = "",
      workSelection = "";
  if (inputSelection === "personal"){
    personalSelection = "checked";
  } else {
    workSelection = "checked";
  }

  Todo.find({completed: false}, function(err, foundTodos){
    if (err) return err;

    res.render("todos", {
      todos: foundTodos, points: points, inputP: personalSelection, inputW: workSelection, userName: userName
    });
  });
});

function adjustDueDate(date){ // adjusting hours, due date is reflecting as 5pm as of the day prior, advancing to 7pm of the correct day
  let dueDate = new Date(date);
  return new Date(dueDate.setHours(dueDate.getHours() + 26));
}

app.post("/addTodo", function(req, res){ //this works to add to DB
  let data = req.body;
  inputSelection = data.todoTypeInput;
  if (data.newTodo.length > 3){
    const todo = new Todo({
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
        if (!err) res.redirect("/");
      });
  }
});

app.post("/updateTodo", function(req, res){
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
            else res.redirect("/");
      });
  }
});

app.post("/finishTodo", function(req, res){
  Todo.findOneAndUpdate({_id: req.body.taskId},{completed: true}, function(err, todo){
    if (err) console.log(err);
    else res.redirect("/");
  });
});

app.listen(3000, function(){
  console.log("Server started on port 3000");
})
