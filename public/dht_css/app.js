function getTempColor(t) {
	if (t >= 35) {
		return '#ff5722';
	} else if (t >= 30) {
		return '#ff9800';
	} else if (t >= 25) {
		return '#ffc107';
	} else if (t >= 18) {
		return '#4caf50';
	} else if (t > 10) {
		return '#8bc34a';
	} else if (t >= 5) {
		return '#00bcd4';
	} else if (t >= -5) {
		return '#03a9f4';
	} else {
		return '#2196f3';
	}
}

function getHumColor(x) {
	var colors = ['#E3F2FD','#BBDEFB','#90CAF9','#64B5F6','#42A5F5','#2196F3','#1E88E5','#1976D2','#1565C0','#0D47A1','#0D47A1'];
	return colors[Math.round(x/10)];
}

function refresh() {
	var xmlHttp = new XMLHttpRequest();

	xmlHttp.onreadystatechange = function()
	{
		if (xmlHttp.readyState == XMLHttpRequest.DONE) {
		  	if (xmlHttp.status == 200)
		    {
		    	var data = JSON.parse(xmlHttp.responseText);

		    	tempGauge.setVal(data.temp).setColor(getTempColor(data.temp));
		    	humGauge.setVal(0.5).setColor(getHumColor(data.hum));
		    } else {
		    	console.log('Refresh failed: ' + xmlHttp.status);
		    }
		}
	}

	xmlHttp.open("GET", "data", true);
	xmlHttp.send();
}
var tempGauge = createVerGauge('temp', -20, 60, ' °C').setVal(0).setColor(getTempColor(0));
var humGauge = createRadGauge('hum', 0, 100, '%').setVal(80).setColor(getHumColor(80));

// document.getElementById('refresh').addEventListener('click', refresh);
// setTimeout(refresh, 100);

var websocket = new WebSocket('ws://' + window.location.hostname + ':81');
websocket.onmessage = function (evt) {
 var obj = JSON.parse(evt.data);
// document.getElementById("temperature").innerHTML = obj.temperature + '&#8451';
// document.getElementById("humidity").innerHTML = obj.humidity + '%';
 tempGauge.setVal(obj.temperature).setColor(getTempColor(obj.temperature));
 humGauge.setVal(obj.humidity).setColor(getHumColor(obj.humidity));
};

function publishAction() {
	alert("Published");
}

var mqtt = require('mqtt');
var options = {
    port: 16242,
    host: 'mqtt://m11.cloudmqtt.com',
    clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    username: 'mntdttex',
    password: '730VZPmi41Fd',
    keepalive: 60,
    reconnectPeriod: 1000,
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    clean: true,
    encoding: 'utf8'
};
var client = mqtt.connect('mqtt://m11.cloudmqtt.com', options);
client.on('connect', function() { // When connected
    console.log('connected');
    // subscribe to a topic
    client.subscribe('topic1/#', function() {
        // when a message arrives, do something with it
        client.on('message', function(topic, message, packet) {
            console.log("Received '" + message + "' on '" + topic + "'");
        });
    });

    // publish a message to a topic
    client.publish('topic1/#', 'my message', function() {
        console.log("Message is published");
        client.end(); // Close the connection when published
    });
});
