const rp = require('request-promise');
const axios = require('axios')

const addNewTask = () => {

    const urlSource = 'https://en.wikipedia.org/wiki/Special:Random'
    rp(urlSource)
    .then((html) => {
     
     //console.log(html)
     titleStart = html.search('<title') + 7
     titleEnd = html.search('</title') - 12
     title = html.substr(titleStart,titleEnd-titleStart)
     //console.log(title)
     const taskToAdd = 'Read ' + 'https://en.wikipedia.org/wiki/' + title.replace(/ /g, "-");
     console.log(taskToAdd)

     const urlTodo = 'http://todo-back-svc:2346/addTask'
     const taskObject = {task: taskToAdd}
   
     if (taskToAdd.length > 140) {
       console.log("Task description max length is 140 characters !")
       return
     }
   
     const createTask = taskObject => {
       const request = axios.post(urlTodo, taskObject)
       //return request.then(response => response.data)
     }
   
     createTask(taskObject)

    })
    .catch((err) => {
      console.log ("Cannot retrieve a random Wikipedia article")
    })   
}

addNewTask()
