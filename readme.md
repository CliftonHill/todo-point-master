# Todo Point master
Make your Todo List fun, with points! Create tasks, edit, assign due dates.

* **by Clifton Hill**
* cliftonhhill [@] gmail [dot] com / [GitHub Profile](https://github.com/CliftonHill) / [LinkedIn](https://www.linkedin.com/in/crusadingthought)
* App live at: <https://guarded-reef-47099.herokuapp.com/>

## Introduction
I wanted to create a fullstack app, and was inspired with some of the elements of the Modern JS Bootcamp (on Udemy), but wanted to make it a little more fun with points. The first part of that implementation is live, further improvements would increase the game and self-competitive elements. Code is all of my design.

Initially app was built as client side only, then rewritten from the ground up as fullstack to have persistent data maintained by mongoDB.

* Made with Node, Express, MongoDB, Heroku deployed, ejs Templating, password encryption (bcrypt), HTML, CSS
* Code is © 2020 by Clifton Hill

## Features:
* Create a task that is either "work" or "personal", radio selection sticks for continued input in same category
* Edit, delete and complete task.
* creates "Add Date" of task, as well as Due date that is editable
* border of task changes to yellow if due that day, red if overdue.
* tracks points for tasks completed, based on difficulty
* tracks how many tasks remain
* MongoDB connected for persistent data
* sort by category (all/personal/work) or filter tasks by typed entry.
* bootstrap connection for modern appearance
* login/registration screen
* passwords include hashing/salting with bcrypt
* responsive site design / mobile friendly

## Programmer Notes:
* sort/filter is done on client side to avoid an unneeded DB access.
* some dynamic searches for correct childNode set up to avoid program breaking if order of Nodes or length changes

## Timeline:
* 8/6/20 - added sample login credentials, added marketing Bootstrap cards w/ custom css
* 7/30/20 - deploying to heroku
* 7/29/20 - mobile ready, css cleaned up
* 7/28/20 - login/registration working, password encryption, bootstrap enabled, CSS cleaning in progress
* 7/25/20 - rewrite for full stack w/ express, mongoDB connection, full function restored
* 7/15/20 - client side program functional - stored in git version control
* Started?

## Future Improvements:
* add stylesheet classes to use for emphasis and color changes to greater differentiate tasks - make a pastel choice of colors so that text is still visible
* will need a user sub category for points to keep track
* store points in mongodb. Running tally of points at top for total, and for each week/day. Urgent tasks don't get extra points, this shows a lack of planning - usually and is not rewarded.
* display points as total, avg/day, total for current day
* generate a chart that shows progress of task points earned over time to see productivity.
* make it searchable by type of difficulty, or date due
* if input category and category tabs match, then keep them there, so you can work within Personal or Work tabs without having to switch back and forth.
* sort drop down (option tags enclosed by select tag), next to filter input to sort by: date created (default) - oldest at top, newest at bottom, due soon (yellow items, w/ red at bottom, then rest), overdue (red items), other? Maybe also a sort for colored items?
* can i also include routing, so that I can have a custom url something like clifton.todos.com?
* finish setting up dynamically searched childNodes to avoid program break; some already complete
* integrate with passport or something else to allow cookies/sessions and authentication

## Bugs Fixed:
* date display issues - reflected time in milliseconds
* only show "Date Due" if not "Invalid Date"
* adjusted stored date values so that due date highlights are more accurate
* difficulty level not filling in edit field from task because other errors were stopping code execution, once I fixed those (wrong childNodes selections) it worked just fine
* replaced *editing* button value back to "edit" if another edit button is clicked instead
* points not registering on heroku. Appear to be due to Model.find and then forEach method not completing before page was rendered. Placed rest of code below foreach, but within Model.find method to make sure that additional code was not executed until after points were tallied.
