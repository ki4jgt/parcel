var crypto = require("crypto")
var ipfs = require("ipfs")

var node = ipfs.create({repo: __dirname+"DB"})

function hasher(s){
    path = ["/db"]
    var hash = crypto.createHash('md5').update(s).digest('hex')
    for (i = 0; i < 5; i++){
        path.push(hash.substr(i*2, 2))
    }
    return path.join("/")
}

class ppd{
    constructor(node){
        this.cid = ""
        
        this.r = 1
        this.w = 1
        
        this.cache = []
        this.write = []
        this.read = []
        
        this.node = node
        
        setInterval(this.reader, 1000)
        setInterval(this.writer, 1000)
    }
    push(dict){
        for (var item of dict){
            this.write.push({item:dict[item]})
        }
    }
    pull(list){
        for (var value of list){
            this.read.push(value)
        }
    }
    drop(list){
        
    }
    async writer(){
        if(this.w){
            this.w = 0
            
            while (this.write){
                entry = this.write.shift()
                
                for (var item of entry){
                    var path = hasher(item)
                    
                    try{
                        current = ""
                        await this.node.files.touch(path)
                        for await (var chunk of this.node.files.read(path)){
                            current += chunk
                        }
                        if (current){
                            current = JSON.parse(current)
                            current[item] = entry[item]
                        }else{
                            current = entry
                        }
                        this.node.files.write(path, JSON.stringify(current))
                        this.cache.push(entry)
                    }catch{
                        console.log(item + " not added!")
                    }
                }
            }
            
            this.w = 1
        }
    }
    async reader(){
        if (this.r){
            this.r = 0
            
            while (this.cache.length > 1000) this.cache.shift()
            while (this.read){
                entry = this.read.shift()
                p = hasher(entry)
                for (var item of this.cache){
                    for (var name of item){
                        if (name == entry){
                            
                        }
                    }
                }
            }
            
            this.r = 1
        }
    }
}