var util = require("./util");
var vector = require("./vector");
var udp = require("./udp");
var web = require("./web");
var color = require( "./color");

var boids = {};

var options = {
	"desiredSeparation": 25.0,
	"neighborDistance": 50.0,
	"maxForce": 0.05,
	"maxSpeed": 3.0,
	"width": 400,
	"height": 400,
	"serverPort": 41234
};

for( i in process.argv )
{
	var arg = process.argv[i];
	var pos = arg.indexOf( "=" );
	
	if ( pos != -1 )
	{
		var key = arg.substring( 0, pos );
		options[key] = arg.substring( pos+1 );
	}
}

function receive( msg )
{
	if ( msg.type == "SET" )
	{
		var tokens = util.tokenize( msg.value, "=" );
		var key = tokens[0];
		var value = tokens[1];
		
		switch( key )
		{
			case "behavior":
				boid[key] = value;
				break;
			case "target":
				boid[key] = parseInt(value);
				break;
			default:
				console.log( "Not supported: %s", key );
				break;
		}
	}
	else if ( msg.type == "EXIT" )
	{
		process.exit();
	}
}

var boid = {
	"type": "SHOPPER",
	"pid": process.pid,
	"port": udp.listen( 0, receive ),
	"color": color.random(),
	"location": { "x": options.width / 2, "y": options.height / 2 },
	"velocity": { "x": util.random( -1.0, +1.0 ), "y": util.random( -1.0, +1.0 ) },
	"behavior": eval( "if ( process.pid % 2 == 0 ) 'wander'; else 'flock'" ),	
	"target": null
};

function send( type, boid )
{
	udp.send( options.serverPort, { "type": type, "boid": boid } );	
}

send( "ENTER", boid );

/* Steering */

function steer( target )
{
	var steer = { "x": 0, "y": 0 };
	
	var desired = vector.subtractFrom( target, boid.location );
	var d = vector.magnitude( desired );
	
	if ( d > 0 )
	{
		desired = vector.normalize( desired );
		desired = vector.multiplyBy( desired, options.maxSpeed );
		
		steer = vector.subtractFrom( desired, boid.velocity );
		steer = vector.limitTo( steer, options.maxForce );
	}
		
	return steer;
}

function separate()
{
	var sum = { "x": 0, "y": 0 };
	var count = 0;
	
	for ( var key in boids )
	{
		var other = boids[key];

		if ( boid.pid != other.pid )
		{
			if ( "SHOPPER" == other.type )
			{
				var d = vector.distance( boid.location, other.location );
		
				if ( (d > 0) && (d < options.desiredSeparation) )
				{
					var diff = vector.subtractFrom( boid.location, other.location );
					diff = vector.normalize( diff );
					diff = vector.divideBy( diff, d );
					sum = vector.addTo( sum, diff );
					count++;
				}
			}
		}
	}
	
	if ( count > 0 )
	{
		sum = vector.divideBy( sum, count );
	}
	
	return sum;
}

function align()
{
	var sum = { "x": 0, "y": 0 };
	var count = 0;
	
	for ( var key in boids )
	{
		var other = boids[key];
		
		if ( boid.pid != other.pid )
		{
			if ( "SHOPPER" == other.type )
			{
				var d = vector.distance( boid.location, other.location );
		
				if ( (d > 0) && (d < options.neighborDistance) )
				{
					sum = vector.addTo( sum, other.velocity );
					count++;
				}		
			}
		}
	}
	
	if ( count > 0 )
	{
		sum = vector.divideBy( sum, count );
		sum = vector.limitTo( sum, options.maxForce );
	}
	
	return sum;	
}

function cohesion()
{
	var sum = { "x": 0, "y": 0 };
	var count = 0;
	
	for ( var key in boids )
	{
		var other = boids[key];

		if ( boid.pid != other.pid )
		{
			if ( "SHOPPER" == other.type )
			{
				var d = vector.distance( boid.location, other.location );
		
				if ( (d > 0) && (d < options.neighborDistance) )
				{
					sum = vector.addTo( sum, other.velocity );
					count++;
				}					
			}
		}
	}
	
	if ( count > 0 )
	{
		sum = vector.divideBy( sum, count );
		sum = steer( sum );
	}
	
	return sum;	
}

function find( vectorLimit, colorLimit )
{
	var target = null;
	
	for ( var key in boids )
	{
		var other = boids[key];

		if ( other.type == "MERCHANT" )
		{
			if ( vector.distance( boid.location, other.location ) < vectorLimit )
			{					
				if ( color.distance( boid.color, other.color ) < colorLimit )
				{
					target = other.pid;
					break;
				}						
			}
		}
	}
	
	return target;
}

function flock()
{
	var acc = { "x": 0, "y": 0 };
	
	acc = vector.addTo( acc, vector.multiplyBy( separate(), 2.0 ) );
	acc = vector.addTo( acc, align() );
	acc = vector.addTo( acc, cohesion() );
	
	return acc;
}

var wandertheta = 0.0;

function wander()
{
	var wanderR = 16.0;
	var wanderD = 60.0;
	var change = 0.25;

	wandertheta += util.random( -change, change );

	var circleLoc = vector.normalize( boid.velocity );
	circleLoc = vector.multiplyBy( circleLoc, wanderD );
	circleLoc = vector.addTo( circleLoc, boid.location );

	circleOffset = { "x": wanderR * Math.cos( wandertheta ),
	 				 "y": wanderR * Math.sin( wandertheta ) };

	return steer( vector.addTo( circleLoc, circleOffset ) );
}

var r = 4.0;

function target( other )
{
	var desired = vector.subtractFrom( other.location, boid.location );
	
	var distance = vector.magnitude( desired );
	
	if ( other.type == "MERCHANT" && distance < r )
	{
		udp.send( other.port, { "type": "CHECKIN", "boid": boid } );
		
		process.exit();		
	}
	
	return steer( other.location );
}

function move()
{
	web.get( "/boids", function( data )
	{
		boids = JSON.parse( data );
	});
	
	var acc = { "x": 0, "y": 0 };
	
	if ( boid.target != null && boids[boid.target] != undefined )
	{
		acc = target( boids[boid.target] );
	}
	else 
	{
		if ( boid.behavior == "wander" )
		{
			acc = vector.addTo( wander(), separate() );			
		}
		else if ( boid.behavior == "flock" )
		{
			acc = flock( acc );
		}
		
		boid.target = find( 100.0, 0.20 );		
	}
	
	// update

	boid.velocity = vector.addTo( boid.velocity, acc );
	boid.velocity = vector.limitTo( boid.velocity, options.maxSpeed );
	
	boid.location = vector.addTo( boid.location, boid.velocity );
	
	boid.location.x = Math.floor( boid.location.x );
	boid.location.y = Math.floor( boid.location.y );
	
	// borders
	
	if ( boid.location.x < -r ) boid.location.x = options.width + r;
	if ( boid.location.y < -r ) boid.location.y = options.height + r;
	if ( boid.location.x > options.width + r ) boid.location.x = -r;
	if ( boid.location.y > options.height + r ) boid.location.y = -r;

	// notify
	
	send( "MOVE", boid );
}

process.on( "SIGINT", function() 
{
	console.log( "SIGINT" );
	process.exit();
});

process.on( "SIGTERM", function() 
{
	console.log( "SIGTERM" );
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

intervalId = setInterval( move, 100 );
