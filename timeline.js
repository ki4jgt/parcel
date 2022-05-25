var ipfs = require("ipfs")
const crypto = require("crypto")
const fs = require("fs")
const request = require("request")

class timeline {
    constructor(ipfs){
        var self = this
        this.timeline = []
        this.profile = {}
        this.key = {}
        this.setup = 1
        ipfs.create({repo: __dirname+"Diary"})
        .then(node => {
            this.node = node
            this._load_profile()
        })
        fs.readdir(__dirname, function (err, files){
            if(err){
                console.log(err)
            }
            files.forEach(function(file){
                if (file == "key.key"){
                    fs.readFile(__dirname + "/key.key", (err, data) => {
                        if (err) throw err;
                        self.key.private = data.toString()
                        self.key.public = crypto.createPublicKey(self.key.private).export({type: "spki", format: "pem"})
                    })
                    self.setup = 0
                }
            })
        })
    }
    async post(post){
        var now = new Date()
        var cid = await this._write(post)
        var block = {
                        post: {
                            message: {
                                author: this._id(),
                                subject: post.subject,
                                cid: cid,
                                time: now.getTime()/1000
                            }
                        },
                        time: now.getTime()/1000,
                        prev: this.profile.current
                    }
        
        block.post = this._sign(block.post)
        cid = await this._write(block)
        this._set("current", cid)
        return this.profile.current
    }
    async _gen(){
        var keys = crypto.generateKeyPairSync("ed25519", {
            publicKeyEncoding: {type: "spki", format: "pem"},
            privateKeyEncoding: {type: "pkcs8", format: "pem"}
        })
        this.key.public = keys.publicKey
        this.key.private = keys.privateKey
        fs.writeFile(__dirname+"/key.key", this.key.private, (err) => {
            if (err) throw err;
        })
        this._set("key", this._id())
        this.setup = 0
    }
    _id(){
        return this.key.public.replace(/-+begin.public.key-+|\n|-+end public key-+/gim, "")
    }
    _construct(key){
        return '-----BEGIN PUBLIC KEY-----\n' + key + '\n-----END PUBLIC KEY-----\n'
    }
    _sign(post){
        var sig = crypto.sign(undefined, JSON.stringify(post.message), this.key.private).toString("hex")
        post.signature = sig
        return post
    }
    _verify(post){
        return crypto.verify(undefined, JSON.stringify(post.message), this._construct(post.message.author), Buffer.from(post.signature, "hex"))
    }
    async _write(data){
        var cid = await this.node.add(JSON.stringify(data))
        cid = String(cid["cid"])
        return cid
    }
    async _read(cid){
        var data = ""
        for await (var chunk of this.node.cat(cid)) data += chunk
        return JSON.parse(data)
    }
    async _load_profile(){
        var profile = ""
        await this.node.files.touch("/profile")
        for await (const chunk of this.node.files.read('/profile')) {
            profile += chunk
        }
        if (profile){
            this.profile = JSON.parse(profile)
        }
    this._broadcast()
    setInterval(this._broadcast, 600000)
    }
    async _set(name, val){
        this.profile[name] = val
        this.node.files.write("/profile", JSON.stringify(this.profile), {create: true, truncate: true})
        console.log(this.profile)
    }
    async _broadcast(){
    }
    async _profilor(peerID){
    }
}

module.exports.timeline = new timeline(ipfs)