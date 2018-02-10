'use strict';

var path = process.cwd();
var Room = require('../models/room.js');

module.exports = function (app, yahooFinance, io) {
	
	io.on('connection', function(client){
    console.log("IO CLIENT CONNECTED");
//    Room.find({}).remove().exec();
	client.join('main');
    Room
				.find({}, function (err, result) {
				if (err) { throw err; }
				if(result[0]==undefined){
					var newRoom = new Room();
					newRoom.name = 'main';
					newRoom.messages = [];
					newRoom.save();
				}
				else{
					Room.findOne({'name':'main'}, function(err,mainroom){
						if(err) throw err;
						console.log(JSON.stringify(mainroom));
						var guestName = "Guest"+Math.floor(Math.random()*10000);
						var result = {
							username: guestName,
							messages: mainroom.messages
						}
						io.sockets.in('main').emit('initial', result);
					});
				}
			});
    
	client.on('add', function(messagedata){

        Room
			.findOneAndUpdate({'name':'main'},{$push: {messages: messagedata}},{new:true}, function(err,mainroom){
				if (err) { throw err; }
					var result = {
						messages: mainroom.messages
					}
					io.sockets.in('main').emit('messageUpdate', result);
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
