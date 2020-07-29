//Home Screen
if (document.querySelector("#register-button")){
  function switchBetweenLogInScreens(){
    document.querySelector("#log-in-form").classList.toggle("hide");
    document.querySelector("#register-form").classList.toggle("hide");
  }

  //switch to register
  document.querySelector("#register-button").addEventListener("click", function(event){
    switchBetweenLogInScreens();

  });
//switch back to login from register card
  document.querySelector("#log-in-button").addEventListener("click", function(event){
    switchBetweenLogInScreens();
  });

  if (document.querySelector(".registration-problem").innerText.length > 0){
    // trying to show register window and hide loging window after a registration problem, ends up showing the wrong window...?
  }


} else { // Not on Home screen, now on todos
  // Todo App functionality
  let taskList = document.querySelectorAll("div[class^='task']");
  let howMany = taskList.length;

  function convertDate(date){ //similar to server.js function, but not exact
    let d = new Date(date),
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

  //Dynamically find correct childNode location - avoids breaking program if length of childNodes is changed with client-side revision ***still have more to do
  function findTodoTypeIndex (list){
    let task = list[0];
    if (task !== undefined){
      for (let i=0; i < task.childNodes.length; i++) {
        if (task.childNodes[i].innerText === "personal" || task.childNodes[i].innerText === "work" ){
          return i;
        }
      }
    }
  }
  let todoTypeIndex = findTodoTypeIndex(taskList);

  function findDateDueIndex (list){
    let task = list[0];
    if (task !== undefined){
      for (let i=0; i < task.childNodes.length; i++) {
        if (task.childNodes[i].classList) {
          if (task.childNodes[i].classList.value === "hide dateDue") {
            return i;
          }
        }
      }
    }
  }
  let dateDueIndex = findDateDueIndex(taskList);

  // highlight tasks for due-soon and due-past
  function highlight(tasks) {
    tasks.forEach(function(task){
      let dateDueFullUTC = task.childNodes[dateDueIndex].innerText;
      if (dateDueFullUTC !== "Invalid Date" || dateDueFullUTC !== ""){
        let currentDate = new Date();
        let taskDueDate = new Date(dateDueFullUTC);
          if (taskDueDate - currentDate < 86400000 && taskDueDate - currentDate > 0) {
            task.className+= " due-soon"; //due soon, change border to yellow
          } else if (taskDueDate - currentDate <= 0) {
            task.className+= " past-due"; // over due, change border to red
          }
      }
    });
  }
  highlight(taskList);

  // Update difficulty field to reflect as bullet Points
  taskList.forEach(function(e){
    let taskDifficulty = e.childNodes[1].childNodes[0].innerText;
    if (taskDifficulty === "1"){
      e.childNodes[1].childNodes[0].innerText = "● ";
    } else if (taskDifficulty === "2") {
      e.childNodes[1].childNodes[0].innerText = "●● ";
    } else if (taskDifficulty === "3") {
      e.childNodes[1].childNodes[0].innerText = "●●● ";
    }
  });


  // Create / Enumerate how many todos remain incomplete
  const statUpdate = document.createElement("h2");
  statUpdate.innerText = howMany === 0 ? "What? Are you on Vacation?" : `You have ${howMany} total task(s) left!`;
  document.querySelector("#remaining").appendChild(statUpdate);

  //Sort by radio input - All/Personal/work
  let radioSelection = "all";
  let radioFilters = document.querySelectorAll("input[name='todoType']");
  for (let i=0; i < radioFilters.length; i++){
    radioFilters[i].addEventListener("click", function(event){
      radioSelection = event.target.value;
      document.querySelector("#search-text").value = ""; // clears filter text
      // hide all, then show for correct category
      taskList.forEach(function(task){
        task.classList.add("hide");
        if (radioSelection === task.childNodes[todoTypeIndex].innerText){
          task.classList.remove("hide");
        } else if (radioSelection === "all") {
          task.classList.remove("hide");
        }
      });
    });
  }

  // Filter results - use input eventListener, then hide all tasks, set RegExp search criteria based on input value, then run filter on nodeList, and if the search criteria pass, then the todo list to be displayed is rebuilt
  document.querySelector("#search-text").addEventListener("input", function(event){
    //hide all first
    taskList.forEach(function(task){
      task.classList.add("hide");
    });
    console.log(event.target.value);
    //foreach run through todo list
    // if typed value matches  that element and radio input selection, then display,
    let inputVal = new RegExp(event.target.value.toLowerCase());
    Array.from(taskList).filter(function(task){
      let todoType = task.childNodes[todoTypeIndex].innerText;
      if (inputVal.test(task.childNodes[1].childNodes[2].innerText.toLowerCase()) && (todoType === radioSelection || radioSelection === "all")){
        task.classList.remove("hide");
      }
    });
  });

  // Edit a task - pulls from client, doesn't access DB
    // assign click event to all items
  let editButtonList = document.querySelectorAll("button[name^='task']");
  editButtonList.forEach(function(button){
    button.addEventListener("click", function(event){

        let taskNum = button.name.slice(4);
        let task = document.querySelector(`div[class^='task${taskNum}']`);
        console.log(task.childNodes);
        document.querySelector("#add-todo-form").action = "/todos/updateTodo";
        editButtonList.forEach(function(button){ // assign all button values: "edit"
          button.innerText = "edit";
        });

        let dateDueFullUTC = task.childNodes[dateDueIndex].innerText;
        event.target.innerText = "*editing*";
        document.querySelector("#add-todo").value = document.querySelector(`div[class^='task${taskNum}'] .task-item`).childNodes[2].innerText;
        document.querySelector("#add-todo-form input[type=date]").value = dateDueFullUTC !== "Invalid Date" ? convertDate(dateDueFullUTC) : "";
        document.querySelector(`#${task.childNodes[todoTypeIndex].innerText}`).checked = true;
        document.querySelector("select.difficulty").value = task.childNodes[1].childNodes[1].innerText;
        document.querySelector("#submit-button").value = "Update";
        document.querySelector("input[name=taskId]").value = taskNum;
        document.querySelector("#add-todo-form").classList.add("update-todo");

    });
  });

}
