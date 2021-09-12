const express = require("express");
const fs = require('fs')
const axios = require('axios')
const request = require('request')

//var tcpp = require('tcp-ping');
//const sqlite3 = require("sqlite3").verbose();
//const rp = require('request-promise');
const app = express();

let connected=false
const urlImage = 'https://picsum.photos/1200'
const pathImage = './public/image.jpg'

const url = 'http://todo-back-svc:2346/' 

const download = (urlImage, pathImage, callback) => {
  request.head(urlImage, (err, res, body) => {
    request(urlImage)
      .pipe(fs.createWriteStream(pathImage))
      .on('close', callback)
  })
}

const imageFile = () => {
  if (!(fs.existsSync(pathImage))) {
    download(urlImage, pathImage, () => {
    console.log('✅ download ok !')
    })
  }
  return 'image.jpg'
}

const image = imageFile()

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");

app.use(express.static("public"));

// res.render
app.get("/", (req, res) => {

  //const url = 'http://todo-back-svc:2346/' 
  //const url = 'http://localhost:3002/' 
  var listOfTasks = []
  var todos = []

  const getAll = async () => {

    const request = await axios.get(url) 
      .then(response => {
      //console.log(response.data)
      listOfTasks.push(response.data)
    })

    for(var i = 0; i <listOfTasks[0].length; i++) {
       todos.push(listOfTasks[0][i])
    }

    //console.log(todos)
    res.render("index", {image: image, todos: todos}); 
  }
  
  getAll()  
})
  

// create new task
app.post("/addTask", (req, res) => {
  
  const { textTodo } = req.body;
  const taskToAdd = req.body.textTodo;

  const url = 'http://todo-back-svc:2346/addTask'
  const taskObject = {task: taskToAdd}

  if (taskToAdd.length > 140) {
    console.log("Task description max length is 140 characters !")
    return
  }

  const createTask = taskObject => {
    const request = axios.post(url, taskObject)
    //console.log(request)
    return request.then(response => response.data)
  }

  createTask(taskObject)
  res.redirect("/");
});



app.put("/moveTaskDone", (req, res) => {
  const { name, id } = req.body;
  const taskId = req.body.id
  const taskName =  req.body.name

  //const url = 'http://localhost:3002/moveTaskDone'
  const url = 'http://todo-back-svc:2346/moveTaskDone'
  
  const taskObject = {id: taskId, name: taskName}

  const moveTask = taskObject => {
    const request = axios.put(`${url}/${taskId}`, taskObject)
    return request.then(response => response.data)
  }

  moveTask(taskObject)
  res.redirect("/");
  
});

app.delete("/deleteTask", (req, res) => {
  const { name, id } = req.body;
  const taskId = req.body.id
  const taskName =  req.body.name

  //const url = 'http://localhost:3002/moveTaskDone'
  const url = 'http://todo-back-svc:2346/deleteTask'
  
  //const taskObject = {id: taskId, name: taskName}

  const deleteTask = taskId => {
    const request = axios.delete(`${url}/${taskId}`)
    return request.then(response => response.data)
  }

  deleteTask(taskId)
  res.redirect("/");
  
});


app.get('/healthz', function(req, res) {

try {
   const request = axios.get(url) 
      .then(response => {
        //console.log(response.data)
        connected=true
    })} catch(error) {
        //console.log("error". error)
}
 
console.log(connected)

if (connected==true) {
   console.log('OK')
   return res.status(200).send('OK');
 }
 console.log('Not connected')
 res.status(500).send('Not connected');
});


app.listen(3000, () => {
  console.log("app is running on port 3000")
})
