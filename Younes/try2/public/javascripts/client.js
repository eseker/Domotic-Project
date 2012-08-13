
var sensors = [12, 22];
var selected = -1;

$(document).ready(function() {
    



  
   $("#btnSendRequest").button('disable');		
  $("#roomid").bind( "change", function(event, ui) {
    var current_value = parseInt($("#roomid").val());
    
    if( selected != current_value)
    {
      selected = current_value;

      if( _.include(sensors, current_value))
      {
          $("#room_setting").hide();
          $("#sensor_setting").show();
          $("#btnSendRequest").button('enable');		
                 
      }else if(current_value == -1)
      {

          // show room settings
          $("#room_setting").hide();
          $("#sensor_setting").hide();
          
          $("#btnSendRequest").button('disable');		
      }else {
          // show room settings
          $("#room_setting").show();
          $("#sensor_setting").hide();   
          $("#btnSendRequest").button('enable');	
      }
    }
  })
  
//

  $('#time_slider_min').change(function() {
      var min = parseInt($(this).val());
      var max = parseInt($('#time_slider_max').val());
      if (min > max) {
          $(this).val(max);
          $(this).slider('refresh');
      }
      
      slideTime();
  });
  $('#time_slider_max').change(function() {
      var min = parseInt($('#time_slider_min').val());
      var max = parseInt($(this).val());

      if (min > max) {
          $(this).val(min);
          $(this).slider('refresh');
      }
      slideTime();
  });

  
  
  function slideTime(){
		var val0 = $('#time_slider_min').val(),
			val1 = $('#time_slider_max').val(),
			minutes0 = parseInt(val0 % 60, 10),
			hours0 = parseInt(val0 / 60 % 24, 10),
			minutes1 = parseInt(val1 % 60, 10),
			hours1 = parseInt(val1 / 60 % 24, 10);
			
		startTime = getTime(hours0, minutes0);
		endTime = getTime(hours1, minutes1);
		$("#time").text(startTime + ' - ' + endTime);
	}
  
  
	function getTime(hours, minutes) {
		var time = null;
		minutes = minutes + "";
		if (hours < 12) {
			time = "AM";
		}
		else {
			time = "PM";
		}
		if (hours == 0) {
			hours = 12;
		}
		if (hours > 12) {
			hours = hours - 12;
		}
		if (minutes.length == 1) {
			minutes = "0" + minutes;
		}
		return hours + ":" + minutes + " " + time;
	}
 
  function sendRequest() {

  
    
    $.mobile.loading( 'show', {
      text: 'Sending request',
      textVisible: true,
      theme: 'a',
      html: ""
    });


    // var red1 =$('#red1')
     //r= red1
     //(r=255,g=120,b=0)= $('#red1');
      
     // $('#blue')= (r=0,g=0,b=255);
    //var blue1='rzrzzrzrrrzrzzrzr'
    //r= blue1
    var roomid = $('#roomid').val();
    //var r = $('#r').val();
    //var g = $('#g').val();
    //var b = $('#b').val();

    //var url = 'room/' + roomid.toString() + '/' + r.toString() + '/' + g.toString() + '/' + b.toString();
    var url = 'room/'+roomid.toString();
    $.get(url, function( data ){
      $('#requestResult').html( data );
      $.mobile.loading( 'hide');
    });

  };


    $('#btnSendRequest').bind('click',sendRequest);
    
});
  