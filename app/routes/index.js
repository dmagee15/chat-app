'use strict';

var path = process.cwd();
var Room = require('../models/room.js');
var User = require('../models/user.js');

module.exports = function (app, yahooFinance, io) {
	
	app.post('/signup', function(req,res){

    	User
			.findOne({'username':req.body.username},function(err,user){
				if (err) { throw err; }
					if(!user){
						var newUser = new User();
						newUser.username = req.body.username;
						newUser.password = req.body.password;
						newUser.save();
						var data = {
							username: req.body.username
						}
						res.send(data);
					}
					else{
						res.send(null);
					}
			});
    	
    });
    app.post('/login', function(req,res){

    	User
			.findOne({'username':req.body.username},function(err,user){
				if (err) { throw err; }
					if(user && user.password==req.body.password){
						var data = {
							username: req.body.username
						}
						res.send(data);
						
					}
					else{
						res.send(null);
					}
			});
    	
    });
    app.post('/logout', function(req,res){

						var guestName = "Guest"+Math.floor(Math.random()*10000);
						var result = {
							username: guestName
						}
						res.send(result);
    	
    });
	io.on('connection', function(client){
    Room.find({}).remove().exec();
	client.join('main');
    Room
				.find({}, function (err, rooms) {
				if (err) { throw err; }
				if(rooms[0]==undefined){
					var newRoom = new Room();
					newRoom.name = 'main';
					newRoom.messages = [];
					newRoom.save();
					var guestName = "Guest"+Math.floor(Math.random()*10000);
						var result = {
							username: guestName,
							messages: []
						}
						io.sockets.in('main').emit('initial', result);
				}
				else{
					Room.findOne({'name':'main'}, function(err,mainroom){
						if(err) throw err;
						var length = rooms.length;
						var roomArray = [];
						for(var x=0;x<length;x++){
							roomArray.push(rooms[x].name);
						}
						var guestName = "Guest"+Math.floor(Math.random()*10000);
						var messageSelection = mainroom.messages;
						var numMessages = mainroom.messages.length;
						if(numMessages>100){
							messageSelection = mainroom.messages.slice(numMessages-100,numMessages);
						}
						var result = {
							username: guestName,
							messages: messageSelection,
							rooms: roomArray
						}
						io.sockets.in('main').emit('initial', result);
					});
				}
			});
    
	client.on('add', function(data){
		var time = new Date();
		var hours = ""+time.getHours();
		hours = (hours.length==1)?"0"+hours:hours;
		var minutes = ""+time.getMinutes();
		minutes = (minutes.length==1)?"0"+minutes:minutes;
		data.messagedata.date = (time.getMonth()+1)+"-"+time.getDate()+" "+hours+":"+minutes;

        Room
			.findOneAndUpdate({'name':data.room},{$push: {messages: data.messagedata}},{new:true}, function(err,room){
				if (err) { throw err; }
					var messageSelection = room.messages;
						var numMessages = room.messages.length;
						if(numMessages>100){
							messageSelection = room.messages.slice(numMessages-100,numMessages);
						}
					var result = {
						messages: messageSelection
					}
					io.sockets.in(data.room).emit('messageUpdate', result);
			});
		
		
		
	});
	client.on('addNewRoom', function(newRoomName){

        Room
			.find({}, function(err,rooms){
				if (err) { throw err; }
				var duplicate = false;
				var length = rooms.length;
				var roomArray = [];
				for(var x=0;x<length;x++){
					roomArray.push(rooms[x].name);
					if(rooms[x].name==newRoomName){
						duplicate = true;
					}
				}
				if(!duplicate&&newRoomName){
					var newRoom = new Room();
					newRoom.name = newRoomName;
					newRoom.messages = [];
					newRoom.save();
					roomArray.push(newRoomName);
					io.sockets.emit('newRoomAdded', roomArray);
				}
/*					var newRoom = new Room();
					newRoom.name = 'main';
					newRoom.messages = [];
					newRoom.save();
					var guestName = "Guest"+Math.floor(Math.random()*10000);
						var result = {
							username: guestName,
							messages: []
						}
						io.sockets.in('main').emit('initial', result);*/
			});
		
		
		
	});
	client.on('joinRoom', function(data){
		
		client.leave(data.previousRoom);
		client.join(data.roomToJoin);
        Room
			.findOne({'name':data.roomToJoin},function(err,room){
				if (err) { throw err; }
				var messageSelection = room.messages;
						var numMessages = room.messages.length;
						if(numMessages>100){
							messageSelection = room.messages.slice(numMessages-100,numMessages);
						}
					var result = {
						room: data.roomToJoin,
						messages: messageSelection
					}
					io.sockets.in(data.roomToJoin).emit('roomJoined', result);
			});
		
		
		
	});
	client.on('signUp', function(data){
		
        Room
			.findOne({'username':data.username},function(err,user){
				if (err) { throw err; }
					if(!user){
						var newUser = new User();
						newUser.username = data.username;
						newUser.password = data.password;
						newUser.save();
					}
			});
		
		
		
	});
	/*client.on('add', function(data){

        Room
			findOneAndUpdate({'name':'main'},{$push: {messages: data}},{new:true}, function(err,data){
				if (err) { throw err; }

				if(!result[0].stockList.includes(data) && result[0].stockList.length<5){
					
					var tempArray = result[0].stockList;
					tempArray.push(data.toUpperCase());
					yahooFinance.historical({
					symbols: tempArray,
					from: '2012-01-01',
					}, function (err, news) {
					if (err){throw err;}
					var j = news;
					var totalSeries = [];
        if(j==null){
            io.sockets.emit('update', null);
        }
        else{
            
        var newArray;
        var colors = ['red','green','blue','orange','purple'];
        var colorCount = 0;

        for(var propName in j) {
            newArray = [];
        if(j.hasOwnProperty(propName)) {
            var propValue = j[propName];

        propValue.forEach(function(item) {
            var val = [(new Date(item.date)).getTime(),item.open];
			newArray.push(val);
        });
        
        newArray = newArray.sort(function(a, b) {
        return a[0] - b[0]; });
        var newSeries = {
		        name: propName,
		        data: newArray,
		        color: colors[colorCount]
		        };
		 colorCount++;
		 totalSeries.push(newSeries);

         }
        }
        var k = totalSeries.filter(removeEmpty);
					if(totalSeries.length==k.length){
						List
						.findOneAndUpdate({}, {$push: {"stockList": data.toUpperCase()}}, function(err, results2){
						if(err){throw err;}
						});
                		io.sockets.emit('update', totalSeries);
					}
					else{
						io.sockets.emit('update', k);
					}

            }
				});
						
					
					
				}
				else{
					var tempArray = result[0].stockList;
					yahooFinance.historical({
					symbols: tempArray,
					from: '2012-01-01',
					}, function (err, news) {
					if (err){throw err;}
					var j = news;
					var totalSeries = [];
        if(j==null){
            io.sockets.emit('update', null);
        }
        else{
            
        var newArray;
        var colors = ['red','green','blue','orange','purple','yellow','black'];
        var colorCount = 0;

        for(var propName in j) {
            newArray = [];
        if(j.hasOwnProperty(propName)) {
            var propValue = j[propName];

        propValue.forEach(function(item) {
            var val = [(new Date(item.date)).getTime(),item.open];
			newArray.push(val);
        });
        
        newArray = newArray.sort(function(a, b) {
        return a[0] - b[0]; });
        var newSeries = {
		        name: propName,
		        data: newArray,
		        color: colors[colorCount]
		        };
		 colorCount++;
		 totalSeries.push(newSeries);

         }
        }
        io.sockets.emit('update', totalSeries);

            }
				});
				}	
			
			});
		
		
		
	}); */
	function removeEmpty(series){
		return series.data.length>0;
	}
	client.on('disconnect', function(){});
	});
	
	app.route('/')
		.get(function (req, res) {
			res.sendFile(path + '/dev/index.html');
		});


};
