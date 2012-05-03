var twilio = require('twilio'),
	twilioClient = twilio.Client,
	twiml = twilio.Twiml,
	express = require('express'),
	app = express.createServer();
	client = new twilioClient('ACa09b866711055b9ddad8c1d5adc2c1c7', 'a4292a6c67e9be8367598054344523ba', 'http://stormy-warrior-5105.herokuapp.com/'),
	phone = client.getPhoneNumber('+14155992671')


phone.setup(function(){
	phone.on('incomingSms', function(reqParams, res) {
		console.log(reqParams.Body)
		console.log(reqParams)
	})
})

app.listen(8000)










































































