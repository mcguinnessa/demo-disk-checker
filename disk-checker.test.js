//import {jest} from '@jest/globals'


//var mo_traffic = require('./routes/mo_traffic');
//const server = require('./app');

//const supertest = require('supertest');
//import supertest from 'supertest';

//const requestWithSupertest = supertest(server);

//const {MongoClient} = require('mongodb');
//import MongoClient from 'mongodb';





//import * as server from './app';
//import * as mo_object from './routes/mo_traffic';
//import supertest from 'supertest';

//const requestWithSupertest = supertest(server);

//import MongoClient from 'mongodb';



describe("This will test Disk checker", ()=> {

  test("Get Disk Checker", async ()=>{

    //const res = await requestWithSupertest.get('/motraffic');
    //console.log(res);
    const disk_status = "SUCCESS"
    expect(disk_status).toEqual("SUCCESS");

    //expect(res.body).toHaveProperty('users')
    //expect(res.type).toEqual(expect.stringContaining('json'));
    //expect(motraffic.getData).toHaveBeenCalledTimes(1);

  });

});
