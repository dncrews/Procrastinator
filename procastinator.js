var twilioClient = require('twilio').Client,
	port = process.env.PORT || 8080
		client = new twilioClient('ACa09b866711055b9ddad8c1d5adc2c1c7','a4292a6c67e9be8367598054344523ba','http://fierce-snow-2861.herokuapp.com/', {"port" : port}),
	phone = client.getPhoneNumber('+18017018979'),
	express = require('express'),
	app = express.createServer()

phone.setup(function(){
	phone.on('incomingSms', function(reqParams, res) {
		console.log(reqParams)
		console.log(res)
		res.send('test')
		res.end()
	})
})

// app.get('/', function(req,res) {
// 	res.send('test')
// })


// app.listen(port)

