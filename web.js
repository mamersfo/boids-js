var http = require("http");

this.get = function( path, func )
{	
	var options = {
		host: "localhost",
		port: 1337,
		path: path
	};
	
	var request = http.get( options, function( response )
	{
		var data = "";
		
		response.on( "data", function( chunk ) {
			data += chunk;
		});
		
		response.on( "end", function() {
			func( data );
		});
		
	}).on( "error", function( e )  
	{
		console.error( "[%d] %s. Exiting.", process.pid, e.message );
		process.exit();
	});
}
