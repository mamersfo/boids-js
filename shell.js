var util = require("./util");
var udp = require("./udp");
var web = require("./web");
var readline = require("readline");

var i = readline.createInterface( process.stdin, process.stdout, null );

i.on( "line", function( line )
{
	var items = line.split( " " );
	
	var action = items[0];

	if ( action == "quit" )
	{
		i.close();
		process.stdin.destroy();
	}
	else
	{
		if ( items.length >= 2 )
		{
			web.get( "/boids?pid=" + parseInt( items[1] ), function( data )
			{
				if ( action == "send" )
				{
					var boid = JSON.parse( data );
					
					if ( items.length >= 4 )
					{
						var type = items[2];
						var value = util.concat( items, 3 );				
						udp.send( boid.port, { "type": type.toUpperCase(), "value": value } );
					}
					else
					{
						console.log( "usage: 'set <key>=<value>'" );
						i.prompt();						
					}
				}
				else if ( action == "kill" )
				{
					var boid = JSON.parse( data );

					udp.send( boid.port, { "type": "EXIT" } );					
				}
				else if ( action == "print" )
				{
					console.log( data );
					i.prompt();					
				}
			});
		}
		else
		{
			console.log( "expected pid" );
			i.prompt();
		}
	}
	
	i.prompt();
});

i.on( "close", function()
{
	console.log( "Bye!" );
	process.exit( 0 );
});

console.log( "Welcome to Boid shell" );
console.log( "Available commands: 'print' | 'send' | 'kill' | 'quit'" );
i.prompt();
