const Sequelize = require('sequelize')

const username = "root"
const password = "1"
const database = "device_sense_dev"
const host = "127.0.0.1"
const dialect = "mysql"

const sql_input = `
SELECT 
	dev.endpointUrl as url, dev.timeOut as failoverTimeout
FROM Subscriptions as s
INNER JOIN DataStores as db ON s.fk_dataStoreId = db.id
INNER JOIN Devices as dev ON s.fk_deviceId = dev.id
	WHERE s.uuid = 123`;

const sql_output = `
SELECT
    db.name, db.type, db.host, db.port, db.protocol, db.username, db.password, db.database, db.failoverTimeout as failoverTimeout, db.bufferMaxSize, db.writeInterval, db.writeMaxPoints
FROM Subscriptions as s
INNER JOIN DataStores as db ON s.fk_dataStoreId = db.id
INNER JOIN Devices as dev ON s.fk_deviceId = dev.id
	WHERE s.uuid = 123`;

const sql_measurements = `
SELECT 
    i.name, i.dataType, i.identifier as field, i.tags, i.nodeId, c.description, s.collectionRate as monitorResolution,
    i.deadbandAbsolute, i.deadbandRelative
FROM Subscriptions as s
INNER JOIN DataStores as db ON s.fk_dataStoreId = db.id
INNER JOIN Devices as dev ON s.fk_deviceId = dev.id
INNER JOIN SubscriptionItems as i ON s.id = i.fk_subscriptionId
INNER JOIN CollectionTypes as c ON s.fk_collectionType = c.id
	WHERE s.uuid = 123`;


// Option 1: Passing parameters separately
const sequelize = new Sequelize(database, username, password, {
  host: host,
  dialect: dialect
})

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

let input
let output
let measurements

sequelize.query(sql_input, { type: sequelize.QueryTypes.SELECT})
  .then(result => {
  	input = result[0]
  })


sequelize.query(sql_output, { type: sequelize.QueryTypes.SELECT})
  .then(result => {
  	output = result[0]
  })

sequelize.query(sql_measurements, { type: sequelize.QueryTypes.SELECT})
  .then(result => {
  	measurements = result
  })
