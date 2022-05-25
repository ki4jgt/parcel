var ipfs = require("ipfs")
var print = console.log()
var fs = require("fs")
var settings = {}

class server{
    constructor(){
        fs.readdir(__dirname, function (err, files){
            if(err){
                print(err)
            }
            files.forEach(function(file){
                if (file == "settings.json"){
                    fs.readFile(__dirname + "/settings.json", (err, data) => {
                        if (err) throw err;
                        settings = JSON.parse(data)
                    })
                }
            })
        })
        ipfs.create()
        .then(node => {
            this.node = node
            this.node.pubsub.subscribe("twine-server.push", this.push)
            this.node.pubsub.subscribe("twine-server.pull", this.pull)
        })
    }
    push(message){
        print(message)
    }
    pull(message){
        print(message)
    }
    pushChan(message){
        
    }
    pullChan(message){
        
    }
}

var s = new server()