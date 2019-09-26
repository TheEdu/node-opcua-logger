"use strict"
const db = require('./sequelize')

const getSubscription = async (uuid) =>  {

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
	subscription.SubscriptionItems.forEach((item) => {
		let obj = {
			name: item.name,
			dataType: item.dataType,
			field: item.identifier,
			tags: item.tags,
			nodeId: item.nodeId,
			collectionType: subscription.CollectionType.description,
			deadbandAbsolute: item.deadbandAbsolute,
			deadbandRelative: item.deadbandRelative
		}
		if (subscription.CollectionType.description == "monitored") {
			obj["monitorResolution"] = subscription.CollectionType.description
		} else if (subscription.CollectionType.description == "polled") {
			obj["pollRate"] = subscription.CollectionType.description
		}
		measurements.push(obj)
	})

	let config = {
		input,
		output,
		measurements
	}

	console.log(config)

}

getSubscription(123)