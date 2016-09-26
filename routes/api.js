var router = require('express').Router();
var passport = require('passport');
var Auth = require('../tools/apiAuth');
var WriteAP = require('../tools/WriteAP');
var API_C = require('../tools/APICodes').Codes
var fs = require('fs');
var multer  = require('multer')
var path = require('path');
var upload = multer({dest: 'musicFiles'})
const mongoose = require("mongoose"), Song = mongoose.model("Song"), User = mongoose.model("User");
//=======================================================================|
function APIError(res,message,code) {
    WriteAP(">!Error: "+message)
    return res.status(code||API_C.Error).json({message: message})
}
function APISucc(res,message) {
    WriteAP(">+Success")//: "+JSON.stringify(message))
    return res.status(API_C.OK).json(message)
}
function APILogin(req,res,next) {
    return passport.authenticate('local',function(err, user, info){
        if (err) {throw err}
        if (!user) {return APIError(res,"Invalid Username/Password ["+info.message+"]")}
        req.logIn(user,function(err) {
            if (err) throw err
            return APISucc(res,{message: "Welcome "+user.firstName+"!",user:{name:user.firstName+" "+user.lastName,email:user.email}})
        });
    })(req,res,next);
}
WriteAP(">*"+"API Level".grey+":")
WriteAP(">>+/auth")
router.post('/auth/:type', function(req, res, next) {
    switch (""+req.params.type) {
        case "1":
            WriteAP("*Performing API Login:")
            APILogin(req,res,next)
            break
        case "2":
            WriteAP("*Performing API SignUp:")
            var bd = req.body||"";
            if (!(bd.name+bd.email+bd.password).length) {APIError(res,"Please fill out all fields");break}
            Auth.findEmail(bd.email,function(state){
                if (state) {APIError(res,"An account with this email already exists",API_C.Conflict);return}
                User.signup(bd.name,bd.email,bd.password,function (i,stat,error) {
                    if (stat!==false) {return APILogin(req,res,next)}
                    APIError(res,error.message)
                })
            })
            break
        default:
            WriteAP("!Recieved State: "+req.params.type+", WTF")
            APIError(res,"[API-Auth] Invalid Login State",API_C.Invalid)
    }
});

WriteAP(">>+/getImage/:id")
router.get('/getImage/:id', Auth.isLoggedIn, function(req, res) {
    Song.findById(req.params.id, (err,song) => {
        if (err) {return APIError(res,err)}
        if (!song) {return APIError(res,"No such song found in database")}
        const image = path.join(__dirname,"..",song.img)
        res.sendFile(image)
    })
});

WriteAP(">>+/playMusic/:id")
router.get('/playMusic/:id', Auth.isLoggedIn, function(req, res) {
    Song.findById(req.params.id, (err,song) => {
        if (err) {return APIError(res,err)}
        if (!song) {return APIError(res,"No such song found in database")}
        const musicFile = path.join(__dirname,"..",song.path)
        res.sendFile(musicFile)
    })
});


WriteAP(">>+/uploadMusic")
router.post('/uploadMusic', Auth.isLoggedIn, upload.single('musicFile'), function(req, res) {
    WriteAP("*Handling Upload File:")
    var file = req.file
    if (!file) {return APIError(res,"No File provided")}
    Song.makeNew(file, req.user._id, (err,song) => {
        if (err) {return APIError(res,err)}
        res.json({song: song})
    })
});

WriteAP(">>+/listData")
router.get('/listData', Auth.isLoggedIn, function(req, res) {
    const ob = {songs:[], users: [], genre: [], artists: []}, art = {}, us = {}, gen = {};
    new Promise(res => User.find({}, (err,users) => {
        users.forEach(u => {(us[u._id] = u).songsUploaded = 0})
        res()
    })).then(_ => {
        Song.find({}).populate("user").exec((err,songs) => {
            if (err) {return APIError(res,err)}
            if (!songs.length) {return APIError(res,"No songs in DB")}
            songs.forEach(s => {
                ob.songs.push({title: s.title, artist: s.artist, genre: s.genre, album: s.album, year: s.year})
                s.artist = s.artist || "Unknown"
                art[s.artist] = art[s.artist] || {artist: s.artist, genre: {}, songs:0}
                art[s.artist].songs++
                if (s.genre) {
                    art[s.artist].genre[s.genre]=1
                    gen[s.genre] = gen[s.genre]||0,gen[s.genre]++
                }
                us[s.user._id].songsUploaded++
            })
            ob.genre = Object.keys(gen).map(k => ({name: k, instances: gen[k]}))
            ob.users = Object.keys(us).map(k => us[k])
            ob.artists = Object.keys(art).map(k => {
                const a = art[k]
                a.genre = Object.keys(a.genre)
                return a
            })
            res.json(ob)
        })
    })
});

WriteAP(">>+/rmDB")
router.get('/rmDB', Auth.isLoggedIn, function(req, res) {
    User.remove({}, function(err) { 
        if (err) {return APIError(res,err)}
        return APISucc(res,"Removed all music entries")
    })
})
//=============================================|
router.use(function(req, res, next) {APIError(res,"Invalid API call",API_C.Invalid)})
//=======================================================================|
module.exports = router;
