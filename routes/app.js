var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var Auth = require("../tools/authChecks")
var Song = mongoose.model("Song")

const palette = {
    primary: "#7199FF",
    accent: "#FF4081",
    music: "#777678",
    bg: "#E8E7F6",
}
//{
//    primary: "#FF5722",
//    accent: "#FF5252",
//    bg: "#374046",
//}

router.get('/', Auth.isLoggedIn, function(req, res) {
    Song.find({}).populate(["-path",{
        path: 'user',
        select: 'firstName lastName _id'
    }]).exec((err,songs) => {
        res.render('app', {user: req.user, palette: palette, songs: songs});
    })
});
router.get('/login', Auth.onlyPublicUser, function(req, res) {
    res.render('login');
})

const logout = function(req, res) {req.isAuthenticated() && req.session.destroy();res.redirect("/")}
router.get('/logout', logout)
router.get('/sign-out', logout)

module.exports = router;
