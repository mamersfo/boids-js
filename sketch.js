
function run ( p )
{
	var boids = {};
	
	p.poll = function()
	{
		var request = new XMLHttpRequest();
		
		request.onreadystatechange = function() {
			if ( request.readyState == 4 && request.status == 200 ) {
				boids = JSON.parse( request.responseText );
			}
		};
		
		request.open( "GET", "http://localhost:1337/boids", true );
		request.send( null );
	}
	
	p.setup = function()
	{
		p.size( 400, 400 );
		p.colorMode( p.RGB, 255, 255, 255, 100 );
		p.smooth();
	};
	
	p.draw = function()
	{
		p.background( 80 );
		
		var r = 4.0;
				
		for ( key in boids )
		{
			var boid = boids[key];
			
			if ( boid.type == "MERCHANT" )
			{
				p.pushMatrix();
				p.translate( boid.location.x, boid.location.y );

				p.stroke( 255 );
				
				p.fill( 255 );
				p.text( boid.pid.toString(), r*5, -r*3 );

				p.fill( 0xFF000000 + parseInt( boid.color, 16 ) );
				p.ellipse( 0, 0, r*8, r*8 );
			
				p.fill( 255 );
				var str = boid.checkins.length.toString();
				p.text( str, 0 - p.textWidth( str ) / 2, r );

				p.popMatrix();
			}			
		}
				
		for ( key in boids )
		{
			var boid = boids[key];
			
			if ( boid.type == "SHOPPER" )
			{
				p.pushMatrix();
				p.translate( boid.location.x, boid.location.y );

				p.stroke( 255 );
				p.fill( 255 );
				p.text( boid.pid.toString(), r*2, -r*2 );

				var angle = Math.atan2( -boid.velocity.y, boid.velocity.x );
				var heading = -1 * angle;
				var theta = heading + p.radians( 90 );
				p.rotate( theta );

				p.beginShape( p.TRIANGLES );
				p.fill( 0xFF000000 + parseInt( boid.color, 16 ) );
				p.vertex( 0, -r*2 );
				p.vertex( -r, r*2 );
				p.vertex( r, r*2 );
				p.endShape();				

				p.popMatrix();
			}			
		}
		
		p.poll();
	};
}