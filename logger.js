"use strict"

var argv = require('minimist')(process.argv.slice(2));
let async = require("async");
let readpump = require("./readpump.js");
let writepump = require("./writepump.js");
const db = require('./sequelize');

const main = async (uuid) =>  {

	let subscription = await db.Subscription.findOne({
						where: {uuid: uuid},
						include: [{ model: db.Device },
								{ model: db.DataStore },
								{ model: db.User },
								{ model: db.SubscriptionItem },
								{ model: db.CollectionType }]
					})

	let input = {
		url: subscription.Device.endpointUrl,
		failoverTimeout: subscription.Device.timeOut
	}

	let output = {
		name: subscription.DataStore.name,
		type: subscription.DataStore.type,
		host: subscription.DataStore.host,
		port: subscription.DataStore.port,
		protocol: subscription.DataStore.protocol,
		username: subscription.DataStore.username,
		password: subscription.DataStore.password,
		database: subscription.DataStore.database,
		failoverTimeout: subscription.DataStore.failoverTimeout,
		bufferMaxSize: subscription.DataStore.bufferMaxSize,
		writeInterval: subscription.DataStore.writeInterval,
		writeMaxPoints: subscription.DataStore.writeMaxPoints
	}

	let measurements = []
	let collectionRateKey = subscription.CollectionType.description == "monitored" ? "monitorResolution" : "pollRate";
	subscription.SubscriptionItems.forEach((item) => {
		let obj = {
			name: subscription.Device.name,
			dataType: item.dataType,
			field: item.identifier,
			tags: JSON.parse(item.tags),
			nodeId: item.nodeId,
			collectionType: subscription.CollectionType.description,
			[collectionRateKey]: subscription.collectionRate,
			deadbandAbsolute: item.deadbandAbsolute,
			deadbandRelative: item.deadbandRelative
		}

		measurements.push(obj)
	})

	let config = { input, output, measurements }
	// console.log(config)

	// start output handles
	let wp = new writepump(config.output);
	wp.Run();

	// get a readpump
	var rp = new readpump(config.input, config.measurements, wp);

	async.forever(
		function(forever_next) {
			rp.Run(function(err) {
				console.log("An error occured in the Readpump:", err)
				let wait = config.failoverTimeout || 5000;
				console.log("Restarting readpump in", wait, "seconds.")
				setTimeout(forever_next, wait)
			});
		},
		function(err) {
			console.log("Restarting readpump...")
		}
	);
}


const uuid = argv['s']

if (uuid) {
	console.log("\nSuscription UUID: ", uuid)
	main(123)
} else {
	console.log('\nEl argumento "s" (uuid de la suscripcion) es requerido.\n\tEj --> nodejs logger.js -s 123 \n')
}