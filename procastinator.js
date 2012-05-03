var twilioClient = require('twilio').Client,
	client = new twilioClient('ACa09b866711055b9ddad8c1d5adc2c1c7','a4292a6c67e9be8367598054344523ba','http://fierce-snow-2861.herokuapp.com/'),
	phone = client.getPhoneNumber('+18017018979'),
	express = require('express'),
	app = express.createServer()

phone.setup(function(){
	phone.on('incomingSms', function(reqParams, res) {
		console.log(reqParams)
		console.log(res)
	})
})

app.get('/', function(req,res) {
	res.send('test')
})

var port = process.env.PORT || 3000

app.listen(port)

