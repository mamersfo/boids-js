var socket = require("dgram").createSocket("udp4");

this.listen = function( port, callback )
{
	socket.on( "message", function( msg, rinfo ) 
	{
		var str = msg.toString( "utf8" );
		callback( JSON.parse( str ) );
	});
	
	socket.on( "close", function()
	{
		console.log( "udp - socket closing" );
	});
	
	socket.on( "error", function( e )
	{
		console.error( "udp - error: %j", e );
	});

	socket.bind( port );
	
	return socket.address().port;
}

this.send = function( port, obj )
{
	var str = JSON.stringify( obj );
	
	var buf = new Buffer( str);
	
	socket.send( buf, 0, buf.length, port, "127.0.0.1", function( err, bytes ) 
	{
		if ( err != null ) console.log( "udp - error: %j", err );
	});
}
