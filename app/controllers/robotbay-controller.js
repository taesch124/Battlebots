const express = require('express');
const async = require('async');
const fs = require('fs');
const path = require('path');
const Robot = require('./../models/robot');
const User = require('./../models/user');

const router = express.Router();

router.get('/:id', (req, res) => {
    let userId = req.params.id;
    Robot.getUserRobotsStats(userId, (results) => {
        res.render('robots', {user_id: userId, robots: results});
    });
});

router.get('/configuration/:userid/:robotid', (req, res) => {
    let userId = req.params.userid;
    let robotId = req.params.robotid;

    let response = {user_id: userId};

    async.parallel({
        robotName: function(callback) {
            Robot.getRobotName(robotId, (results) => {
                response.robot_name = results[0].name;
                callback(null, results);
            });
        },
        configuration: function(callback) {
            Robot.getUserRobotConfiguration(userId, robotId, (results) => {
                response.robot_parts = results;
                callback(null, results);
            });
        }
    }, 
    (err, results) => {
        if(err) throw err;
        res.render('robotbay', response);
    });
    
});

router.get('/inventory/:userid', (req, res) => {
    let userId = req.params.userid;
    let robotId = req.query.robotId;
    let positionId = req.query.positionId;

    let response = {};

    async.parallel({
        userInventory: function(callback) {
            User.getUserInventory(userId, (results) => {
                results.map(e => {
                    e['robot_id'] = robotId;
                    e['position_id'] = positionId;
                });
                response.available_parts = results;

                callback(null, results);
                
            });
        },
        partExists: function(callback) {
            Robot.checkRobotPart(robotId, positionId, (results) => {
                response.available_parts.forEach(e => {
                    results.length > 0 ? e.partExists = true : e.partExists = false;
                });
               
                callback(null, results);
            });
        }
    },
    (err, results) => {
        if(err) throw err;
        res.render('replace-part', {layout: false, response: response});
    });

});

router.put('/robot/:robotid', (req, res) => {
    let robotId = req.params.robotid;
    let partId = req.body.partId;
    let positionId = req.body.positionId;
    Robot.updateRobotPart(robotId, partId, positionId, (results) => {
        res.end();
    });
    
});

router.post('/robot/:robotid', (req, res) => {
    let robotId = req.params.robotid;
    let userId = req.body.userId;
    let partId = req.body.partId;
    let positionId = req.body.positionId;
    Robot.addRobotPart(userId, robotId, partId, positionId, (results) => {
        res.end();
    });
});

router.delete('/robot/:robotid', (req, res) => {
    let robotId = req.params.robotid;
    let positionId = req.body.position_id;

    console.log(robotId, positionId);
    Robot.removeRobotPart(robotId, positionId, (results) => {
        res.end();
    });
    
});

//**for create new robot */

router.get('/createBot/:userid', function(req, res) {
    let userId = req.params.userid;
    let response = {user_id: userId};

    res.render('createBot', response);
});

//****POST****/
//**unncomment out below */

router.post('/createBot/:userid',(req, res) =>{
    let name= req.body.name;
    let userID = req.params.userid;

    Robot.newRoboto(userID, name, (results)=>{
        res.end()
    })
})

module.exports = router;