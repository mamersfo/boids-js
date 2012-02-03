this.magnitude = function( v ) 
{
	return Math.sqrt( v.x * v.x + v.y * v.y );
}

this.normalize = function( v )
{
	var m = this.magnitude( v );

	if ( m > 0 ) 
	{
		return this.divideBy( v, m );
	}

	return v;
}

this.distance = function( v1, v2 )
{
	var dx = v1.x - v2.x;
	var dy = v1.y - v2.y;
	
	return Math.sqrt( dx*dx + dy*dy );
}

this.subtractFrom = function( v1, v2 )
{
	var result = {};
	result.x = v1.x - v2.x;
	result.y = v1.y - v2.y;
	return result;
}

this.divideBy = function( v, n )
{
	var result = {};
	result.x = v.x / n;
	result.y = v.y / n;
	return result;
}

this.addTo = function( v1, v2 )
{
	var result = {};
	result.x = v1.x + v2.x;
	result.y = v1.y + v2.y;
	return result;
}

this.multiplyBy = function( v, n )
{
	var result = {};
	result.x = v.x * n;
	result.y = v.y * n;
	return result;
}

this.limitTo = function( v, max )
{
	var result = v;

	var m = this.magnitude( v );

	if ( m > max ) 
	{
		result = this.normalize( v );
		result = this.multiplyBy( result, max );
	}
	
	return result;
}