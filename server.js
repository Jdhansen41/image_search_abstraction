// server.js
// where your node app starts

// init project
const express = require('express')
const app = express()
const cors = require("cors")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const Bing = require("node-bing-api")({ accKey: "84558bef71d84f6da3babc3040588b8f",
                                       rootUri: "https://api.cognitive.microsoft.com/bing/v7.0/"}) //Webapi key for Bing (Microsoft Azure)
const searchTerm = require('./models/searchTerm')
// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'))
app.use(bodyParser.json())
app.use(cors())
mongoose.connect(process.env.SECRET|| 'mongodb://localhost/searchTerms')

app.get("/", (req,res,next)=>{
  res.sendfile("views/index.html")
})

//Get all search terms from the database
app.get("/api/recentsearchs", (req,res,next)=>{
  searchTerm.find({}, (err, data)=>{
  res.json(data)
  })
})

// Get call for searching for image
app.get("/api/imagesearch/:searchVal*", (request, response, next) => {
  var { searchVal } = request.params; //ES6 notation
  var { offset } = request.query; //Searchs for offset. i.e "/test?offset=2 will produce 2
  var data = new searchTerm({
    searchVal,
    searchDate: new Date()
  })
  data.save(err =>{
    if(err){ return response.send("err saving to db")}
           
  })
  var searchOffset
  //Does offset exist
  if(offset){
   if(offset==1){ 
     offset=0 
     searchOffset=1
   } 
    else if(offset >1){
      searchOffset = offset+1
    }
  }
  // Bing API call
  Bing.images(searchVal, {
   top: (10*searchOffset), //show 10 results
   skip: (10*offset) 
  }, function(error, rez, body){
  var bingData =[]
  
  //Push results into an array that we can then display
  for(var i=0; i<10; i++){
    bingData.push(
      {
        url: body.value[i].webSearchUrl,
        snippet: body.value[i].name,
        thumbnail: body.value[i].thumbnailUrl,
        context: body.value[i].hostPageDisplayUrl
      }
    )  
  }
    response.json(bingData)
  })
})



// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`)
})
