var util = require("./util");
var udp = require("./udp");
var web = require("./web");
var vector = require("./vector");
var color = require("./color");

var options = {
	"serverPort": 41234
};

var boid = {
	"type": "MERCHANT",
	"pid": process.pid,
	"port": udp.listen( 0, receive ),
	"color": color.random(),
	"location": { 
		"x": parseInt( process.argv[2] ), 
		"y": parseInt( process.argv[3] ) 
	 },
	"checkins": []
};

function send( type, boid )
{
	udp.send( options.serverPort, { "type": type, "boid": boid } );	
}

function receive( msg )
{
	if ( msg.type == "CHECKIN" )
	{
		boid.checkins.push( msg.boid.pid );
	}
	else if ( msg.type == "EXIT" )
	{
		process.exit();
	}
	else if ( msg.type == "SET" )
	{
		var tokens = util.tokenize( msg.value, "=" );
		var key = tokens[0];
		var value = tokens[1];
		
		switch( key )
		{
			case "x":
			case "y":
				boid.location[key] = value;
				break;
			default:
				console.log( "Not supported: %s", key );
				break;
		}		
	}
}

send( "ENTER", boid );

function update()
{
	send( "UPDATE", boid );
}

process.on( "SIGINT", function() 
{
	process.exit();
});

process.on( "SIGTERM", function() 
{
	process.exit();
});

process.on( "exit", function()
{
	send( "EXIT", boid );
});

process.on( "uncaughtException", function( e )
{
	console.error( e.stack );
	process.exit();
});

setInterval( update, 1000 );
