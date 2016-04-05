#!/usr/bin/env /usr/local/bin/node

var bitbar = require('bitbar');

var os = require('os');
var ifaces = os.networkInterfaces();
var httpclient = require("httpclient");

var color = bitbar.darkMode ? 'white' : 'black';

var opts = {
  host: "apis.baidu.com",
  path: "/heweather/weather/free",
  headers: {
    apikey: "788871b6928e1203a9e535106e3aa534"
  },
  query: {
    city: "无锡"
  }
};
var isBrowser = new Function("try {return this===window;}catch(e){ return false;}");
if (isBrowser()) opts.jsonp = 'jsoncallback'
httpclient.get(opts, function (err, res) {
  if (err) {
    console.log(err);
  } else {
    var msg = opts.jsonp ? res : JSON.parse(res.toString());
    var dataKey = Object.keys(msg)[0];
    var data = msg[dataKey][0];
    var output = [
        {
            text: data.now.cond.txt + " " + data.now.fl + ".",
            color: color,
            dropdown: false
        },
        bitbar.sep,
        {
            text: data.daily_forecast[0].date,
        },
        {
            text: data.daily_forecast[0].cond.txt_d,
            color: color
        },
    ];

    bitbar(output);
  }
});
