const express = require("express")
const cors = require('cors')
//const NATS = require('nats');
const { connect, StringCodec } = require("nats");
let connected = false;

const pw = process.env.POSTGRES_PASSWORD.toString()

const { Client } = require('pg')
const client = new Client({
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password:  pw,
  host: 'postgres-db-lb',
  port: 5432,
})

client.connect(function(err) {

  if (!(err)) {
    console.log("Connected!");
    connected=true;

  // create table pong if it does not exist
  const query_0 = `SELECT count(*) FROM information_schema.tables WHERE table_name = 'todo';`;
  client.query(query_0, (err, res) => {

    var rowCount = Number(res.rows[0].count)
    console.log(rowCount) 

    if (rowCount===0) {
      const query_1 = `CREATE TABLE todo(id SERIAL PRIMARY KEY, task VARCHAR(140) UNIQUE, status INT DEFAULT 0);`
      client.query(query_1, (err, res) => {
        if (err) {
            console.error(err + res + ' table creation error');
            return;
        }
        console.log('Table todo created !')
      })
    }
    }) 
  }
  })

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(cors())


const natsHost = process.env.NATS || '';
const sc = StringCodec();

let nc = null; 
const connectToNats = async () => 
{
    console.log(natsHost)   
    try { 
       nc = await connect({ servers: natsHost, json: true })
       console.log("Connected to nats successfully")
    } catch(err) {
      console.log(err)
      console.log("Nats connection failed")
    }
}

// res.render
app.get("/", (req, res, next) => {

  const sql = `SELECT * FROM todo ORDER BY id;`;
  console.log(sql)

  client.query(sql, (err, result) => {
     if (err) {
        console.error(err);
        return;
     }
     var listOfTasks =[];
     result.rows.forEach((a) => {
       listOfTasks.push(a)
      })
      //console.log(listOfTasks)
      res.json(listOfTasks)
  });  
})
    

// create new task
app.post('/addTask', async (req, res) => {

  try {
    const task = req.body.task
    //console.log(task)
    if (task.length > 140) {
      console.log('Task description can be max 140 characters !')  
    } else {
      const newTodo = await client.query(`INSERT INTO todo (task) VALUES ('${task}') RETURNING *;`);
      res.json(newTodo.rows[0]);
      console.log('Task ' + task + ' was added successfully')
      
      var datetime = new Date();
      createdDate = datetime.toISOString().slice(0,19)
      console.log(createdDate);

      const todoObj = {
        id: newTodo.rows[0].id,
        task: task,
        status: 0, 
        created: createdDate
      };
      
      todoPub = sc.encode(JSON.stringify({ method: "POST", ...todoObj }));

      if(nc) {        
        console.log("Publishing...")
        await nc.publish("todos", todoPub) 
      }
    }
  } catch(err) {
    console.log(err.message);
  }   
});


app.put('/moveTaskDone/:id', (req, res) => {
  const { name, id } = req.body;
  const taskId = req.body.id
  console.log(req.body)

  sql = `UPDATE todo SET status=1 WHERE id=${taskId};`   
  console.log(sql)

  client.query(sql, async (err, result) => {
      if (err) {
        return console.log(err.message);
      }       
      console.log('Move of task id ' + taskId + ' successful !')

      var datetime = new Date();
      changedDate = datetime.toISOString().slice(0,19)
      console.log(createdDate);

      const todoObj = {
        id: taskId,
        status: 1, 
        changedDate: changedDate
      };
      
      todoPub = sc.encode(JSON.stringify({ method: "PUT", ...todoObj }));

      if(nc) {        
        console.log("Publishing...")
        await nc.publish("todos", todoPub) 
      }
  })  
});

app.delete('/deleteTask/:id', (req, res) => {
  const taskId = req.params.id
  console.log(taskId)

  var sql = `DELETE FROM todo WHERE id=${taskId};`
  console.log(sql)

  client.query(sql, async (err, result) => {
      if (err) {
        return console.log(err.message);
      }       
      console.log('Task id' + taskId + ' deleted successfully !')

      var datetime = new Date();
      deletedDate = datetime.toISOString().slice(0,19)
      console.log(deletedDate);

      const todoObj = {
        id: taskId,        
        deletedDate: deletedDate
      };
      
      todoPub = sc.encode(JSON.stringify({ method: "DELETE", ...todoObj }));

      if(nc) {        
        console.log("Publishing...")
        await nc.publish("todos", todoPub) 
      }
  })  
});


const isConnected = () => {
  return connected;
}

 
app.get('/healthz', (req, res) => {
  
  if(isConnected()) {
    return res.status(200).send('OK');
  }

  res.status(500).send('Not connected');
});


app.listen(3002, () =>{
   console.log("app is running on port 3002")
   connectToNats()
});
