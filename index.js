const express = require('express')
const pug = require('pug')
const app = express()
const request = require("request")

var bodyParser = require('body-parser')
var multer = require('multer')
var upload = multer()

const timeline = require("./timeline.js")

tl = timeline.timeline

// resource folder
app.use("/res", express.static("resources"))

// Post data
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(upload.array())
app.use(express.static('public'))

// paths
// Setup
app.get("/setup", async (req, res) => {
    res.send(pug.renderFile("pages/setup.pug"))
})
app.post("/setup", async (req, res) => {
    for (const key of Object.keys(req.body)){
        tl._set(key, req.body[key])
    }
    tl._gen()
    res.redirect("/")
})

// Root
app.get("/", async (req, res) => {
    tl._profilor(tl._id())
    if (tl.setup){
        res.redirect("/setup")
    }else{
        res.send(pug.renderFile("pages/home.pug"))
    }
})

app.get("/display", async (req, res) => (
    res.send(pug.renderFile("pages/display.pug"))
))

// Post
app.get("/post", async (req, res) => {
    if (tl.setup){
        res.redirect("/setup")
    }else{
        res.send(pug.renderFile("pages/post.pug"))
    }
})
app.post("/post", async (req, res) => {
    add = await tl.post(req.body)
    res.send(pug.renderFile("pages/posted.pug", {cid: add}))
})

//code
app.get("/code", async (req, res) => {
    res.send(pug.renderFile("pages/code.pug"))
})
// API
// Timeline
app.get("/api/:method/:id", async (req, res) => {
    if (req.params.method == "timeline"){
        res.json(tl.timeline.slice(req.params.id * 50, req.params.id * 50 + 50))
    }
})

app.get("*", async (req, res) => {
    res.status(404).send(pug.renderFile("pages/404.pug"))
})

// service
app.listen(8080, () => {
    console.log(`listening on localhost:8080`)}
)