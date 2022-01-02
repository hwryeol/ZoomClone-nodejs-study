import express from"express";
import http from "http"
import path from "path"
import {Server} from "socket.io";
const __dirname = path.resolve();

const app = express();

app.set("view engine","pug");
app.set("views",__dirname + "/src/views" );
app.use("/public", express.static(__dirname+"/src/public"));
app.get("/",(_,res) => res.render("home"));
app.get("/*",(_,res) => res.redirect("/"));


const handleListen = () => console.log("Listening on http://localhost:3000");

const server = http.createServer(app);
const io = new Server(server);
const sockets = [];

io.on('connection', (socket) => {
    socket.onAny((event) => {
        console.log(`Socket Event:${event}`);
    })
    socket.on('room', (roomName,showRoom) => {
        socket.join(roomName);
        showRoom();
        socket.to(roomName).emit("welcome")
    });
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

server.listen(3000,handleListen);



