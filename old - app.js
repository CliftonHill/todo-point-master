/*

-FEATURES:
-nd be able to filter between.
-Edit, delete and complete task.
-updates total tasks left dynamically
-creates "Add Date" of task, as well as Due date that is editable
-border of task changes to yellow if due that day, red if overdue.
-tracks points for tasks completed

BUGS TO FIX:
-radio buttons for adding type of todo and for filtering******<<<<<<< tab sort and type filter don't layer together, want to be able to select all personal tasks for instance and filter within that group, as opposed to the total.

BUGS FIXED:
-date display issues
-only show Date Due if there is a non-null value

LEFT OFF ON:
-7/15/20 I am changing the app substantially to make it work with mongodb and express, before today I can restore older git version if I run into a problem.
*/

//OLD APP

 function howMany(list){
   let count = 0;
   list.forEach(function(item){
     if (item.completed === false) {
       count++;
     }
   });
 return count;
 }

 function addDate() { /// produces new date in yyyy-mm-dd string format
     let d = new Date(),
         month = "" + (d.getMonth() + 1),
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

 function formatDate(date) { // used for converting date to viewer-friendly form
   //correcting for day, for some reason day is coming in 1 day prior to actual, but just by converting from a string to numbers corrects the date
   let dateArr = date.split("-");
   let newA = dateArr.map(function(element){
     return parseInt(element);
   });

   let correctedDateArr = newA.join("-");
   let d = new Date(correctedDateArr);
   return d.toLocaleString("default", {year: "numeric", month: "short", day: "2-digit", year: "numeric"});
 }

 // Point tracker
 let points = 0;

 // Create / Enumerate how many todos remain incomplete
 const statUpdate = document.createElement("h2");
 statUpdate.innerText = `You have ${howMany(todos)} task(s) left!`;
 document.querySelector("#remaining").appendChild(statUpdate);

 function updateHowManyHeader () {
   document.querySelector("#remaining h2").innerText = `You have ${howMany(todos)} task(s) left!`;
 }

 //Render todos ** update task class #. Once we updgrade to mongodb, we can reference by db perm unique ID
 let todoNumber = 6;

 // Display only tab specific items - **PROBLEM: doesn't work with filter, the two features do not layer
 function renderTodos(todos){
   todos.forEach(function(item, index){
         if (item.completed === false){
           appendTodo(item, index);
         }
       });
 }

 function dateDue (date){
   if (date === undefined || date === ""){
     return "";
   } else {
     return `<span class="dateDue">Due: ${formatDate(date)}</span>`
   }
 }

 function appendTodo(item, index){

   // Add Border highlight for due-soon and past-Due
     if (item.dateDue !== undefined || item.dateDue !== ""){
       let currentDate = new Date();
       let itemDueDate = new Date(item.dateDue);
       itemDueDate.setHours(itemDueDate.getHours() + 26); // adjusting hours, due date is reflecting as 5pm as of the day prior, advancing to 7pm of the correct day
       if (itemDueDate - currentDate < 86400000 && itemDueDate - currentDate > 0) {
         todo.className+= " due-soon"; // due soon, change border to yellow
       } else if (itemDueDate - currentDate <= 0) {
         todo.className+= " past-due"; // over due, change border to red
       }
     }

   //Editable task event
   document.querySelector(`button[name='task${+ item.id}']`).addEventListener("click", function(event){
     event.target.innerText = "*editing*"; // *done
     document.querySelector("#add-todo").value = item.text; // *done
     document.querySelector("#add-todo-form input[type=date]").value = item.dateDue || ""; // *done
     document.querySelector("#" + item.todoType).checked = true;  //*done
     document.querySelector("#submit-button").value = "Update"; // *done
     document.querySelector("#recordText").innerText = "Record #"; //*done
     document.querySelector("#recordNumber").innerText = item.id; //*done
     document.querySelector("#add-todo-form").classList.add("update-todo"); //*

   });
   //Complete Task event
   document.querySelector(`button[name="finish${item.id}"]`).addEventListener("click", function(event){
      todos[index].completed = true;
      //add to points **temporary, change when mongodb is set up
      points++;
      document.querySelector("#points span").innerText = points;
      // Remove all
      document.querySelectorAll("p[class^='task']").forEach(function(task){
        task.remove();
        });
      //Re-render
      renderTodos(todos);
      //Update howMany
      updateHowManyHeader();
   });
 }
 // renderTodos(todos); // the first render

 //Add new todos & Edit Todos (update mode)
 document.querySelector("#add-todo-form").addEventListener("submit", function(event){
   event.preventDefault();
   //Update mode for tasks
   let addTodoForm = document.querySelector("#add-todo-form")
   let editingTaskNumber = Number(document.querySelector("#recordNumber").innerText);
   if (addTodoForm.classList.contains("update-todo")){
     addTodoForm.classList.remove("update-todo");
     document.querySelector("#submit-button").value = "Add Todo";
     document.querySelector("#recordText").innerText = "";
     document.querySelector("#recordNumber").innerText = "";
     let updateTodo = event.target.elements.newTodo.value;
     let updateDateDue = event.target.elements.todoDateDue.value;
     event.target.elements.newTodo.value = "";
     event.target.elements.todoDateDue.value = "";
     if (updateTodo.length > 0) {
         let foundIndex = todos.findIndex(function(todo){
           if(todo.id === editingTaskNumber){
             return todo;
           }
         });
         // UPDATE Todo Array
         todos[foundIndex].text = updateTodo;
         todos[foundIndex].todoType = event.target.elements.todoTypeInput.value;
         todos[foundIndex].dateDue = updateDateDue;

         // Remove all
         document.querySelectorAll("p[class^='task']").forEach(function(task){
           task.remove();
           });
         //Re-render
         renderTodos(todos);
         //Update howMany
         updateHowManyHeader();
         }

   //Back to regular Add new Todo mode
 } else {
   const newTodo = event.target.elements.newTodo.value;
   if (newTodo.length > 0) {
     todos.push({
       text: newTodo,
       todoType: event.target.elements.todoTypeInput.value,
       dateMade: addDate(),
       dateDue: event.target.elements.todoDateDue.value,
       completed: false,
       id: todoNumber // Use current unused todoNumber
     });
     todoNumber++;
     // Remove all
     document.querySelectorAll("p[class^='task']").forEach(function(task){
       task.remove();
       });
     //Re-render
     renderTodos(todos);
     //update count
     updateHowManyHeader()
     // clear input fields
     event.target.elements.newTodo.value = "";
     event.target.elements.todoDateDue.value = "";
     }
   }

 });

 //Filter items - use input eventListener, then remove all tasks, set RegExp search criteria based on input value, then run filter on todos array, and if the search criteria pass && the item is not completed, then the todo list to be displayed is rebuilt
 document.querySelector("#search-text").addEventListener("input", function(event){
   //remove all first
   document.querySelectorAll("p[class^='task']").forEach(function(task){
     task.remove();
   });
   console.log(event.target.value);
   //foreach run through todo list
   // if typed value matches  that element, then display, ***might be able to put below into a function, and reuse that function for this filter as well as the tab radio sort for all/personal/work below
   let inputVal = new RegExp(event.target.value.toLowerCase());
   todos.filter(function(item){
     if (inputVal.test(item.text.toLowerCase()) && item.completed === false){
       appendTodo(item);
     }
   }); // end of filter
 });

 //Sort by personal/work/all - first apply eventListener, then remove all, then rebuild list
 let radioFilters = document.querySelectorAll("input[name='todoType']");
 for (let i=0; i < radioFilters.length; i++){
   radioFilters[i].addEventListener("click", function(event){
     let selection = event.target.value;

   // remove all
   document.querySelectorAll("p[class^='task']").forEach(function(task){
     task.remove();
     });
   //
   todos.filter(function(item){
     if (item.todoType === selection && item.completed === false){
       appendTodo(item);

     } else if (selection === "all" && item.completed === false){
       appendTodo(item);
     }
     //  if already checked, don't sort. ***what was this for?
   });
 });
 }

 //Reset radio filter to All
 document.querySelector("#add-todo").addEventListener("click", function(event){
   document.querySelector("#allTab").checked = true;
   //remove all
   document.querySelectorAll("p[class^='task']").forEach(function(task){
     task.remove();
     });
   renderTodos(todos);
 });
