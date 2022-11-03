const express = require("express");
const app = express();
require("dotenv").config();
const { route } = require(".");
var router = express.Router();
const redis = require("redis");

const redisClient = redis.createClient({
    url: 'redis://cab432a2image-001.km2jzi.0001.apse2.cache.amazonaws.com:6379'
});

redisClient.connect();

redisClient.on('connect', function () {
    console.log('redis connected');
})

redisClient.on('error', (err) => {
    console.log('Error '+ err);
})

redisClient.setEx('abcd', 3600, 'test'); // Redisに送る

redisClient.get('abcd').then((result) => { //Redisから引っ張ってくる
    if (result) {
        console.log(result);
    }
    else {
        console.log('no result');
    }
})