request = require("request")
const artistAPI = a => "http://ws.audioscrobbler.com/2.0/?method=artist.search&artist="+encodeURIComponent(a)+"&api_key=f9bf1226ba99dbda3ef7d9cf009ed0ed&format=json"

request.get(artistAPI("Yo Honey Singh"), (err,resp, body) => {
                    body = typeof body=="object"?body:JSON.parse(body)
                    const data = body.results.artistmatches.artist
                    if (!data.length) {return}
                    const img = {}
                    data[0].image.forEach(o => img[o.size] = o["#text"])
                    console.log(img.mega || img.extralarge || img.large)
                })