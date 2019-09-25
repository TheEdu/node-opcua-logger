"use strict"

let async = require("async");
let influx = require("influx");

let output = new influx({
	host :           "192.168.56.202",
	port :           8086, // optional, default 8086
	protocol :       "http", // optional, default 'http'
	username :       "",
	password :       "",
	database :       "test",
	failoverTimeout: 10000 
});


var points = [
  //first value with tag
  [{value2: 232}, { tag: 'foobar'}],
  //second value with different tag
  [{value2: 212}, { someothertag: 'baz'}],
  //third value, passed as integer. Different tag
  [123, { foobar: 'baz'}],
  //value providing timestamp, without tags
  [{value: 122, time : new Date()}]
]
 
var points2 = [
  //first value with tag
  [{value2: 1232, value3: false}, { tag: 'foobar'}],
  //second value with different tag
  [{value2: 223212, value3: true}, { someothertag: 'baz'}],
  //third value, passed as integer. Different tag
  [12345, { foobar: 'baz'}],
  //value providing timestamp, without tags
  [{value: 23122, time : new Date()}]
]

var series = {
    series_name_one : points,
    series_name_two : points2
};

output.writeSeries(series, function(err, response){
	console.log(err)
});	