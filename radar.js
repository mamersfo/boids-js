var udp = require("./udp");
var url = require("url");

var boids = {};

function onMessage( msg )
{
	if ( "EXIT" == msg.type ) 
	{
		delete boids[msg.boid.pid];		
	}
	else 
	{
		boids[msg.boid.pid] = msg.boid;		
	}
}

udp.listen( 41234, onMessage );

var http = require("http");
var fs = require("fs");

http.createServer( function ( req, res )
{
	var parts = url.parse( req.url, true );
	
	if ( "/boids" == parts.pathname )
	{
		if ( typeof( parts.query.pid ) != 'undefined' )
		{
			var pid = parseInt( parts.query.pid );
			var boid = boids[pid];
			
			if ( boid != undefined )
			{
				res.writeHead( 200, { 
					"Content-Type": "application/json"
				});
				
				res.end( JSON.stringify( boid ) );
			}
			else
			{
				res.writeHead( 404 );
				res.end( "Not found" );
			}
		}
		else
		{
			res.writeHead( 200, { 
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*" 
			});

			res.end( JSON.stringify( boids ) );			
		}
	}
	else
	{
		fs.readFile ( parts.pathname.substring( 1 ), function ( err, data ) 
		{
			if ( err )
			{
				res.writeHead( 404 );
				res.end( "Not found" );
			}
			else
			{
				res.writeHead( 200 );
				res.end( data );
			}
		});
	}	
}).listen( 1337, "localhost" );

console.log( "Server running at http://localhost:1337" );
