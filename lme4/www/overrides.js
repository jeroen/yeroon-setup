Ext.lib.Event.resolveTextNode = Ext.isGecko ? function(node){
	if(!node){
		return;
	}
	var s = HTMLElement.prototype.toString.call(node);
	if(s == '[xpconnect wrapped native prototype]' || s == '[object XULElement]'){
		return;
	}
	return node.nodeType == 3 ? node.parentNode : node;
} : function(node){
	return node && node.nodeType == 3 ? node.parentNode : node;
};

	// EXTRA CODE //
	
function openWindowWithPost(url,name,keys,values){
	var newWindow = window.open("", name); 
	if (!newWindow) return false;
	var html = "";
	html += "<html><head></head><body><form id='formid' method='post' action='" + url + "'>";
	if (keys && values && (keys.length == values.length))
	for (var i=0; i < keys.length; i++)
	html += "<input type='hidden' name='" + keys[i] + "' value='" + values[i] + "'/>";
	html += "</form><script type='text/javascript'>document.getElementById(\"formid\").submit()</script></body></html>";
	newWindow.document.write(html);
	return newWindow;
}	