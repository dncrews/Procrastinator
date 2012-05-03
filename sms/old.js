var querystring = require('querystring'),
	http = require('http'),
	tBaseUrl = 'https://api.twilio.com',
	accountSID = 'ACa09b866711055b9ddad8c1d5adc2c1c7',
	sendUrl = '/2010-04-01/Accounts/' + accountSID + '/SMS/Messages.json',
	number = '+18017018979',
	applicationSid = 'AP6ed8d504d1a75063a07b0ad776795a85'

var post_data = querystring.stringify({
	'From' : number,
	'To' : '+18012435260',
	'Body': 'Super Duper Test'
});

var options = {
	'host': tBaseUrl,
	'port': '443',
	'path': sendUrl,
	'method': 'POST'
}

console.log(options)
console.log("\n" + post_data)

req = http.request(options, function(res) {
	res.setEncoding('utf8')
	res.on('data', function(chunk) {
		console.log(chunk)
	})
})

req.write(post_data)
req.end()



// app.listen(8000)










































































