
function sendRequest() {
	var roomid = $('#roomid').val();
	var r = $('#r').val();
	var g = $('#g').val();
	var b = $('#b').val();
	//var onoff = $('#flip-1').val();
	var url = 'room/' + roomid.toString() + '/' + r.toString() + '/' + g.toString() + '/' + b.toString();
	$.get(url, function( data ){


		$('#requestResult').html( data );

	});


};

//$(document).ready(function() {
	$('#btnSendRequest').bind('click',sendRequest);


//