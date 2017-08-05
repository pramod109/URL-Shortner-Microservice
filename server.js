//Get Requirements
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const shortUrl = require('./models/shortUrl.js')
app.use(bodyParser.json())
app.use(cors())

//connect to database
mongoose.connect(process.env.SECRET)

//Allow to get index page
app.use(express.static(__dirname + '/public'))

//Part-1 Create a database entry
app.get('/new/:urlToShorten(*)', (req,res,next)=> {
    var {urlToShorten} = req.params
    //Regex for URL 
    var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    var regex = expression
    if (regex.test(urlToShorten)===true){
        var short = Math.floor(Math.random()*100000).toString()

        var data = new shortUrl(
            {
                originalUrl: urlToShorten,
                shorterUrl: short
        })
        data.save(err=>{
            if(err) {
                return res.send("Error in saving to database")
            }
        })

        return res.json(data)
    }
    var data = new shortUrl({
        originalUrl: "INVALID",
        shorterUrl: "INVALID"
    })
    return  res.json(data)
})

//Part 2 URL to forward

app.get('/:urlToForward', (req,res,next)=>{
    var shorterUrl = req.params.urlToForward
    shortUrl.findOne({'shorterUrl': shorterUrl}, (err,data) =>{
        if (err) return res.send('ERROR Reading DataBase')
        var re = new RegExp("^(http|https)://","i")
        var strToCheck = data.originalUrl
        if(re.test(strToCheck)){
            res.redirect(301, data.originalUrl)
        }
        else{
            res.redirect(301, 'http://' + data.originalUrl)
        }    
    })
})


//Listen to see everything is working
app.listen(3000, ()=>{
    console.log('Everything is working!')
})
