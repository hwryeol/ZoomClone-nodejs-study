import express from"express";
import { WebSocketServer } from 'ws';
import http from "http"
import path from "path"

const __dirname = path.resolve();

const app = express();

app.set("view engine","pug");
app.set("views",__dirname + "/src/views" );
app.use("/public", express.static(__dirname+"/src/public"));
app.get("/",(_,res) => res.render("home"));
app.get("/*",(_,res) => res.redirect("/"));


const handleListen = () => console.log("Listening on http://localhost:3000");

const server = http.createServer(app);
const wss = new WebSocketServer({server});

const sockets = [];

function onSocketMessage(message){
    sockets.forEach(aSocket => aSocket.send(message.toString()));
    console.log(message.toString())
}

wss.on("connection",(socket) => {
    sockets.push(socket);
    socket.send("hello");
    socket.on("message",onSocketMessage)
    socket.on("close",() => console.log("Disconnected"));
})

server.listen(3000,handleListen);



