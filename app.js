//load express

var express = require('express')

var app = express()

//static content path
app.use(express.static(__dirname + '/debug'))

app.listen(3333)