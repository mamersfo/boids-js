
this.random = function( a, b )
{
	return a + (b - a) * Math.random();
}

this.tokenize = function( str, token )
{
	var result = {};
	
	var pos = str.indexOf( token );
	
	if ( pos != -1 )
	{
		result[0] = str.substring( 0, pos );
		result[1] = str.substring( pos+1 );
	}
	else
	{
		result[0] = str;
		result[1] = null;
	}

	return result;
}

this.concat = function( array, offset )
{
	var result = "";

	for ( i=offset; i < array.length; i++ )
	{
		if ( result.length > 0 )
		{
			result += " ";
		}
		
		result += array[i];
	}
	
	return result;
}
