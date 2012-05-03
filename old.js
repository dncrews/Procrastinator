var querystring = require('querystring'),
	http = require('http'),
	tBaseUrl = 'https://api.twilio.com',
	accountSID = 'ACa09b866711055b9ddad8c1d5adc2c1c7',
	sendUrl = '/2010-04-01/Accounts/' + accountSID + '/SMS/Messages.json',
	number = '+18017018979',
	applicationSid = 'AP6ed8d504d1a75063a07b0ad776795a85'

var post_data = querystring.stringify({
	'From' : number,
	'To' : '+8012435260',
	'Body': 'Super Duper Test'
});

var options = {
	host: tBaseUrl,
	port: '443',
	path: sendUrl,
	method: 'POST',
	headers: {
		'Content-Type': 'application/x-www-form-urlencoded',
		'Content-Length': post_data.length
	}
}

console.log(options)
console.log("\n" + post_data)

req = http.request(options, function(res) {
	res.setEncoding('utf8')
	res.on('data', function(chunk) {
		console.log(chunk)
	})
})

// req.write("From=" + number + "&To=+14159352345&Body=Jenny%20please%3F%21%20I%20love%20you%20%3C3")
req.write(post_data)
req.end()



// app.listen(8000)










































































