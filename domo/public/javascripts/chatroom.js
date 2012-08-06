var messageCount = 0;
 
function handleNewMessages(data) {
    data = data.messages;
    var msgList = $('#msgList');
    for (var i = 0; i &amp;lt; data.length; i++) {
        msgList.append('&amp;lt;li&amp;gt;&amp;lt;span style="color : blue;"&amp;gt;' + data[i].author +
                    ' :&amp;lt;/span&amp;gt; ' + data[i].message + '&amp;lt;/li&amp;gt;');
    }
    messageCount += data.length;
}
 
function requestNewMessages() {
    $.getJSON('/latest/' + messageCount, null, handleNewMessages);
}
 
function onMessageSent(data) {
    console.log('Message sent? ' + data.status);
    requestNewMessages();
}
 
function sendMessage(msg, target) {
    $.post(target, { message : msg }, onMessageSent);
}
 
$(document).ready(function() {
    $('#sendForm').submit(function(e) {
        sendMessage($('#msgBox').val(), $('#sendForm').attr('action'));
        return false;
    });
    requestNewMessages();
    setInterval(requestNewMessages, 5000);
});