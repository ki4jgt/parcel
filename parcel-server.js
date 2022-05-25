const crypto = require("crypto")
const express = require("express")
var app = express()

var bodyParser = require('body-parser')
var multer = require('multer')
var upload = multer()

db = {}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(upload.array())

function verify(post){
    return crypto.verify(undefined, JSON.stringify(post.message), construct(post.message.author), Buffer.from(post.signature, "hex"))
}
function construct(key){
        return '-----BEGIN PUBLIC KEY-----\n' + key + '\n-----END PUBLIC KEY-----\n'
    }

app.get("/:key", async (req, res) => {
    res.json(db[req.params.key])
})
app.post("/", async (req, res) => {
    var post = JSON.parse(req.body.post)
    console.log(post)
    if (verify(post)){
        db[post.message.author] = post
        console.log(db)
    }
    res.json({OK: 200})
})

// service
app.listen(9000, () => {
    console.log(`9000`)}
)