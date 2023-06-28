const db_tools = require('./mongo_tools');
const {MongoClient} = require('mongodb');

const DAY_S = 24 * 60 * 60;
const DAY_MS = DAY_S * 1000;
const HOUR_MS = 60 * 60 * 1000;
const INTERVAL_S = 60 * 60;
const INTERVAL_MS = INTERVAL_S * 1000;

const max_disk = 73;
const min_disk = 33;
const free_space = 28;

var disk_usage = min_disk;

//nst hourly_weighting = [1, 2, 3, 4, 5, 6, 7, 8, 9 10, 11, 12, 13, 14 ,15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
const hourly_weighting = [1, 2, 1, 1, 1, 1, 2, 2, 5,  5,  5, 4,  5,  6,  6,  5,  7,  5,  8,  8,  8,  9,  10,  10]


function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function getValue(a_timestamp){
  var record_hour = a_timestamp.getHours();
  weighting = hourly_weighting[record_hour];

  if (70 == Math.floor(Math.random() * 100)){
    console.log("Clean Disk!");
    disk_usage -= free_space;
    disk_usage -= Math.floor(Math.random() * free_space);
  }

  disk_usage += ((Math.floor(Math.random() * 50) - 12) / 100);
  if (disk_usage > max_disk) {disk_usage = max_disk;}
  if (disk_usage < min_disk) {disk_usage = min_disk;}


  //const ceiling = (max_disk / 10) * weighting;
//  var disk_usage = min_disk + Math.floor(Math.random() * (max_disk - min_disk));

  //console.log("TIME:" + a_timestamp + " HOUR:" + record_hour + " WEIGHTING:" + weighting + " CEILING:" + ceiling + " DISK:" + disk_usage);
//  console.log("TIME:" + a_timestamp + " HOUR:" + record_hour + " WEIGHTING:" + weighting + " DISK:" + disk_usage);
  console.log("TIME:" + a_timestamp + " HOUR:" + record_hour + " DISK:" + disk_usage);
  return disk_usage;
}

async function run(){

  const uri = await db_tools.get_url();
  console.log("URI");
  console.log(uri);
  const client = new MongoClient(uri);


  try {
    const database = client.db(db_tools.DB_NAME);
    const metric_record = database.collection(db_tools.COLLECTION_NAME);
    var now = new Date();


    const d_res = await metric_record.deleteMany({"$and": [{timestamp: {"$lt": now }}, { "diskUsage": {$exists : true } }]} )
    console.log("Delete:" + d_res.deletedCount);

//    metric_record.deleteMany({"$and": [{timestamp: {"$lt": now }}, { "diskUsage": {$exists : true } }]} , (err, d_res) => {
//      if (err) throw err;
//      console.log("Delete:" + d_res.deleteCount);
//    })

    var last_week = new Date(now - (DAY_MS * 7));
    var date_record = last_week;
    console.log("Last Week:" + last_week)

    while (date_record <= now){

      disk_usage = await getValue(date_record); 

      const doc = {
        timestamp: date_record,
        "diskUsage": disk_usage,
      }  

      const result = await metric_record.insertOne(doc);
      //console.log(`A document was inserted with the _id: ${result.insertedId}` + " DISK:" + disk_usage);
      //date_record = new Date(date_record.getTime() + INTERVAL_MS);
	    
      date_record = new Date(date_record.getTime() + INTERVAL_MS);
      //date_record.setMinutes(date_record.getMinutes() + 10);
      //console.log("DATE:" + date_record)
    }

    while (true) {
       console.log("Sleeping for " + INTERVAL_MS)
       await sleep(INTERVAL_MS);
       var right_now = new Date();
       disk_usage = await getValue(right_now);
       const doc = {
         timestamp: right_now,
         "diskUsage": disk_usage,
       }  

       const result = await metric_record.insertOne(doc);
       console.log(`A document was inserted with the _id: ${result.insertedId}` + " DISK:" + disk_usage);
    }

  } finally {
    await client.close();
  }
}
run().catch(console.dir);
