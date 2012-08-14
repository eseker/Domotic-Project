
var selected = -1; // selected sensors
// UI
var submit_button, room_setting, 
sensor_setting, time_slider_min, 
time_slider_max, time_label, room_selector, 
lights_selector, interruptor_flip, timelighing;


var rooms = ["Salle &agrave; manger", "Salon"];
var devices = [ 
            {"id": 4, "sensor": false, "name" : "Lampe central", room: 0, interruptor:true, color:"#000000"},
            {"id": 12, "sensor": true, "name" : "Capteur IR", room: 0, lights: [{"id": 4, "name" : "Lampe 1"}], startTime: 540, endTime:1020, duration:5 , color:"#000000", light:4},
  				  {"id": 21, "sensor": false, "name" : "Lampe central", room: 1,  interruptor:true, color:"#000000"},
            {"id": 22, "sensor": true, "name" : "Capteur IR", room: 1, lights: [{"id": 5, "name" : "Lampe 2"}], startTime: 540, endTime:1020, duration: 10, color:"#000000", light:5 },
            {"id": 23, "sensor": false, "name" : "entr&eacutee", room: 1, interruptor:true, color:"#000000"}
            ];



   
function sensor_by_room(index){
  return _.filter(devices, function(element){ return element.room == index; });
}

function sensor_by_id(id){
  return _.find(devices, function(element){ return element.id == id; });
}

// populates select list from array of items given as array: [{ name: 'text', value: 'value' }]
function populate(selector, elements)
{
   $.each(elements, function (j) {
      // option(value='-1', selected=true) // "+elements[element_id].name+"
      var option_element = $("<option value='"+elements[j].id+"'>"+elements[j].name+"</option>");
      selector.append(option_element);
    });
}





function select_devise(id){
  var current = sensor_by_id(id);
  if( selected != current)
  {
    selected = current;
    
     if (localStorage) {
        localStorage['selected'] = id;
      }
    
    if(current){
      if( selected.sensor){
        room_setting.hide();
        sensor_setting.show();
        submit_button.button('enable');		    
        
        time_slider_min.val(parseInt(selected.startTime)).slider("refresh");
        time_slider_max.val(parseInt(selected.endTime)).slider("refresh");
              		   
        populate(lights_selector, selected.lights);            
        timelighing.val(parseInt(selected.duration)).slider("refresh");
        
        lights_selector.val(selected.light).selectmenu('refresh');
        
      }else {
        // show room settings
        room_setting.show();
        sensor_setting.hide();   
        
        if (selected.interruptor)  
          interruptor_flip.val('on').slider("refresh");
        else
          interruptor_flip.val('off').slider("refresh");

        
        submit_button.button('enable');	
      }
    }else{
      // show room settings
      room_setting.hide();
      sensor_setting.hide();
      submit_button.button('disable');
    }
    
    
  }
}



function notifyChanged(){
  if (localStorage) {
    localStorage['devices'] = JSON.stringify(devices);
  }
}


function slideTime(){
	var val0 = time_slider_min.val(),
		val1 = time_slider_max.val(),
		minutes0 = parseInt(val0 % 60, 10),
		hours0 = parseInt(val0 / 60 % 24, 10),
		minutes1 = parseInt(val1 % 60, 10),
		hours1 = parseInt(val1 / 60 % 24, 10);
		
		selected.startTime = val0;
		selected.endTime  = val1;
    
    notifyChanged();
    
	startTime = getTime(hours0, minutes0);
	endTime = getTime(hours1, minutes1);
	time_label.text(startTime + ' - ' + endTime);
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

  $.post("/send", selected, function( data ){
    $('#requestResult').html( data );
    $.mobile.loading( 'hide');
  });

};


$('[data-role="page"]').live('pageshow', function () {

  submit_button = $("#btnSendRequest");
  room_setting = $("#room_setting");
  sensor_setting= $("#sensor_setting"); 
  time_slider_min = $('#time_slider_min');
  time_slider_max = $('#time_slider_max');  
  time_label= $("#time_label");
  room_selector= $("#room_selector");
  lights_selector = $("#lights_selector");
  interruptor_flip = $("#interruptor_flip");
  timelighing = $("#timelighing");
  
  interruptor_flip.slider('enable');
  
  submit_button.button('disable');		
  submit_button.bind('click',sendRequest);
   
   
  // restore last settings if possible
  if (localStorage) {
    // Le navigateur supporte le localStorage
    if(localStorage['devices']){
      try
      {
        devices = JSON.parse(localStorage['devices']); 
      }catch(exception) { }
    }
  } 

   $.each(rooms, function (i) {
     var optgroup = $('<optgroup/>');
     optgroup.attr('label', rooms[i]);
     room_selector.append(optgroup);
     
     // select devices
     var elements = sensor_by_room(i);
     populate(room_selector, elements);
    
   });
   
   
   // select the saved device
    if(localStorage['selected']){
         var saved_id = parseInt(localStorage['selected']);
         select_devise(saved_id);
         room_selector.val(saved_id).selectmenu('refresh', true);
     }
     
   
   // listening to room selector change
   room_selector.bind( "change", function(event, ui) {
     select_devise(parseInt(room_selector.val()));
     notifyChanged();
  })
  
  lights_selector.bind( "change", function(event, ui) {
     selected.light = parseInt(lights_selector.val());
     notifyChanged();
  })
  
  
  interruptor_flip.bind( "change", function(event, ui) {
    selected.interruptor = interruptor_flip.val() == "on" ? true : false;
    notifyChanged();
  });
  
  timelighing.change(function() {
    var value = parseInt($(this).val());
    selected.duration = value;
    notifyChanged();
  });
  
  //
  time_slider_min.change(function() {
      var min = parseInt($(this).val());
      var max = parseInt(time_slider_max.val());
      if (min > max) {
          $(this).val(max);
          $(this).slider('refresh');
      }
      slideTime();
  });
  
  time_slider_max.change(function() {
      var min = parseInt(time_slider_min.val());
      var max = parseInt($(this).val());

      if (min > max) {
          $(this).val(min);
          $(this).slider('refresh');
      }
      slideTime();
  });

    
});
  