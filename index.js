#!/usr/bin/env /usr/local/bin/node

"use strict"

var bitbar = require('bitbar');

var moment = require('moment');
var httpclient = require("httpclient");

var color = bitbar.darkMode ? '#ffffff' : '#000000';
moment.locale('zh-cn');
let today = moment().format("YYYY-MM-DD");

function pad(pad, str, padLeft) {
  if (typeof str === 'undefined') 
    return pad;
  if (padLeft) {
    return (pad + str).slice(-pad.length);
  } else {
    return (str + pad).substring(0, pad.length);
  }
}

var opts = {
  host: "apis.baidu.com",
  path: "/heweather/weather/free",
  headers: {
    apikey: "788871b6928e1203a9e535106e3aa534"
  },
  query: {
    city: "无锡"
  },
  timeout: 60
};
var isBrowser = new Function("try {return this===window;}catch(e){ return false;}");
if (isBrowser()) opts.jsonp = 'jsoncallback';

httpclient.get(opts, function (err, res) {
  if (err) {
    console.log(err);
  } else {
    let msg = opts.jsonp ? res : JSON.parse(res.toString());
    let dataKey = Object.keys(msg)[0];
    let data = msg[dataKey][0];

    let daily_forecast = [];
    for (let i = 0; i < data.daily_forecast.length; i++) {
      let forecastData = data.daily_forecast[i];
      let date = `${moment(forecastData.date).format("MM-DD")} ${moment(forecastData.date).format("ddd")}`;
      let cond = forecastData.cond.txt_d === forecastData.cond.txt_n ? forecastData.cond.txt_d : `${forecastData.cond.txt_d}到${forecastData.cond.txt_n}`;
      cond = pad("     ", cond, false);
      let tmp = `${forecastData.tmp.max}℃ - ${forecastData.tmp.min}℃`;
      let dayDataObject = [
        {
          text: `${date}\t${cond}\t${tmp}`,
          color: "#777777"
        },
        {
          text: forecastData.wind.dir + " - " + forecastData.wind.sc,
          color: "#999999",
          size: 12
        },
        {
          text: `降水概率：${forecastData.pop}% - 降水量：${forecastData.pcpn}mm`,
          color: "#999999",
          size: 12
        },
        bitbar.sep
      ];
      daily_forecast = daily_forecast.concat(dayDataObject);
    }

    var hourly_forecast = [];
    for (let i = 0; i < data.hourly_forecast.length; i++) {
      var forecastData = data.hourly_forecast[i];
      var hourDataObject = [
        {
          text: forecastData.date.replace(today, ""),
          color: "#444444"
        },
        {
          text: "气温：" + forecastData.tmp + "℃\t\t" + forecastData.wind.dir + " " + forecastData.wind.sc,
          color: "#777777"
        },
        {
          text: "降水概率：" + forecastData.pop + "%",
          color: "#777777"
        },
        bitbar.sep
      ];
      hourly_forecast = hourly_forecast.concat(hourDataObject);
    }

    var output = [
        {
          text: data.now.cond.txt + " - " + data.now.fl + "℃ - " + data.aqi.city.pm25,
          color: color,
          dropdown: false
        },
        bitbar.sep,
        ...hourly_forecast,
        ...daily_forecast
    ];

    bitbar(output);
  }
});
