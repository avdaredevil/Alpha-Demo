var mongoose = require('mongoose');
var WriteAP = require('../tools/WriteAP');
var audio = require('musicmetadata');
var fs = require('fs');
var request = require('request');

// URL Injection not allowed!
const artistAPI = a => "http://ws.audioscrobbler.com/2.0/?method=artist.search&artist="+encodeURIComponent(a)+"&api_key=f9bf1226ba99dbda3ef7d9cf009ed0ed&format=json"

SongSchema = mongoose.Schema({
	title:      {type: String, trim: true, required: true},
	artist:     {type: String, trim: true},
	genre:      {type: String, trim: true},
	album:      {type: String, trim: true},
	year:       Number,
	duration:   Number,
	artistPic:  {type: String, trim: true},
	img:        {type: String, trim: true},
	path:       {type: String, required: true},
	user:       {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
});
SongSchema.virtual("picture").get(function(){
    return (this.img && "/api/getImage/"+this._id) || this.artistPic
})
SongSchema.set("toJSON",{virtuals: true})
SongSchema.set("toObject",{virtuals: true})

const fileNameGen = t => t.replace(/\W|\.mp3/g,'')+Math.random()+Date.now()
SongSchema.statics.makeNew = function(fileData, user, done){
    const ob = {}, file = fileData.path, imagePath = "./musicFiles/img/"
    new Promise(res => {
        audio(fs.createReadStream(file), {duration: true}, (err, meta) => {
            if (err) {return done(err)}
            ob.path = file;ob.user = user;
            ["title","year","duration","album"].forEach(k => {ob[k]=meta[k]})
            if (!ob.title) {ob.title = fileData.originalname.replace(/\.mp3$/g, '')}
            if (ob.year.length != 4) {ob.year = (''+ob.year).replace(/\D/g,'').slice(0,4)}
            ob.artist = meta.albumartist[0] || meta.artist[0]
            ob.genre = meta.genre[0]
            if (!fs.existsSync(imagePath)){fs.mkdirSync(imagePath)}
            const name = imagePath+fileNameGen(ob.title)
            if (meta.picture.length) {
                fs.writeFile(name, meta.picture[0].data, (err,done) => {
                    if (err) {console.log(err);return done(err)}
                    ob.img = name;res()
                })
            }
            res()
        })
    }).then(_ => new Promise(res => {
        if (!ob.artist) {return res()}
        request.get(artistAPI(ob.artist), (err,resp, body) => {
            if (err) {WriteAP("!Could not download Artist image for ["+ob.artist.yellow+"]");return res()}
            body = typeof body=="object"?body:JSON.parse(body)
            const data = body.results.artistmatches.artist
            if (!data.length) {return res()}
            const img = {}
            data[0].image.forEach(o => img[o.size] = o["#text"])
            ob.artistPic = img.mega || img.extralarge || img.large
            res()
        })
    })).then(_ => {
        if (!ob.artistPic) {ob.artistPic = "https://gravatar.com/avatar/"+Math.random()+"?d=identicon&s=1000"}
        Song.create(ob, done)
    })
}

SongSchema.statics.search = function(query, done) {
	Song.findOne({title: query}).select("+user").exec(function(err, user){
		if(err) {throw err}
		if(!user) {return done(null, false, {message : 'Incorrect email'});}
		hash(password, user.salt, function(err, hash){
			if(err) throw err;
			if(hash == user.hash) return done(null, user);
			done(null, false, {
				message : 'Incorrect password'
			});
		});
	});
};

var Song = mongoose.model("Song", SongSchema);
module.exports = Song;