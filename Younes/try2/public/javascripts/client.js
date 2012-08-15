
var selected = -1; // selected sensors
// UI
var submit_button, room_setting, 
sensor_setting, time_slider_min, 
time_slider_max, time_label, room_selector, 
lights_selector, interruptor_flip, timelighing, sensor_color, device_color;


var rooms;
var devices;


            
function device_by_room(index){
  return _.filter(devices, function(element){ return element.room == index; });
}

function device_by_id(id){
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
  var current = device_by_id(id);
 
  if( selected != current)
  {
    selected = current;
    
   
     if (localStorage) {
        localStorage['selected'] = id;
      }
   
   
    if(current){
      if( selected.sensor == true){
        room_setting.hide();
        sensor_setting.show();
        submit_button.button('enable');		    
        
        time_slider_min.val(parseInt(selected.startTime)).slider("refresh");
        time_slider_max.val(parseInt(selected.endTime)).slider("refresh");
              		   
                     
                 
        timelighing.val(parseInt(selected.duration)).slider("refresh");
        lights_selector.val(selected.light).selectmenu('refresh');
        
        sensor_color.css("background-color", current.color);
      }else {
        // show room settings
        room_setting.show();
        sensor_setting.hide();   
        
        if (selected.interruptor == "true")  
          interruptor_flip.val('on').slider("refresh");
        else
          interruptor_flip.val('off').slider("refresh");

        device_color.css("background-color", current.color);
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



function saveSettings(){
 
  console.log("saving ", devices);
  $.post("/settings", {data:devices}, function( data ){
    console.log("/settings", data);
  });
  
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
    
	startTime = getTime(hours0, minutes0);
	endTime = getTime(hours1, minutes1);
	time_label.text(startTime + ' - ' + endTime);
}

// function to convert hex format to a rgb color
function rgb2hex(rgb) {
  var hexDigits = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];
  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  function hex(x) {
    return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
  }
  return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
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
    console.log("/send", data);
    if(data == "ok"){
        saveSettings();
    }
    $.mobile.loading( 'hide');
      
    
  });

};


$('li.color-thumb').live('click', function(){
    var color = rgb2hex($(this).css('background-color'));
    selected.color = color;
    if(selected.sensor == true)
    {
      sensor_color.css("background-color", selected.color);  
    }else {
      device_color.css("background-color", selected.color);
    }
    $('#colorPopup').popup('close');
    sendRequest();
});

$('[data-role="page"]').live('pageshow', function () {



$.mobile.loading( 'show', {
    text: 'Load settings',
    textVisible: true,
    theme: 'a',
    html: ""
  });

  $.getJSON("/settings", function( data ){
    devices = data.devices;
    rooms = data.rooms;
    $.mobile.loading( 'hide');
    init();
  });
  
  
});

function init()
{
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
  sensor_color = $("#sensor_color");
  device_color = $("#device_color");
  
  interruptor_flip.slider('enable');
  
  submit_button.button('disable');		
  submit_button.bind('click',sendRequest);
   
   
  $.each(rooms, function (i) {
    var optgroup = $('<optgroup/>');
    optgroup.attr('label', rooms[i]);
    room_selector.append(optgroup);
    lights_selector.append(optgroup);
    
    // select devices
    var elements = device_by_room(i);
    populate(room_selector, elements);
    populate(lights_selector, elements);    
  });
   
   
   // select the saved device
    if(localStorage['selected']){
         var saved_id = parseInt(localStorage['selected']);
         select_devise(saved_id);
         room_selector.val(saved_id).selectmenu('refresh', true);
     }
   
  
   
   // listening to room selector change
   room_selector.bind( "change", function(event, ui) {
    console.log("device id"+parseInt(room_selector.val()));
     select_devise(parseInt(room_selector.val()));
  })
  
  lights_selector.bind( "change", function(event, ui) {
     selected.light = parseInt(lights_selector.val());
  })
  
  
  interruptor_flip.bind( "change", function(event, ui) {
    selected.interruptor = interruptor_flip.val() == "on" ? true : false;
  });
  
  timelighing.change(function() {
    var value = parseInt($(this).val());
    selected.duration = value;
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

    
}
  