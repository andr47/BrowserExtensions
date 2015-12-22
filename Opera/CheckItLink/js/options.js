// options.js
var JSOptions;

function save_options() {
  	var min = JSOptions.getItem("notifyIntervalMin");
	var max = JSOptions.getItem("notifyIntervalMax");
	var val = JSON.parse($('#NotifyIntervalInput').val());
	var re = new RegExp(/^[1-9][0-9]?/i);
	if(!re.test(val)){
		val = JSOptions.getItem("notifyInterval");
	}
	else if(val > max || val < min){
		val = JSOptions.getItem("notifyInterval");
	}
	$('#NotifyIntervalInput').val(String(val));
	chrome.storage.sync.set(
		{
			"notifyInterval": String(val), 
			"notifyFlag": String($('#NotifyCheckbox').prop("checked")),
			"showButton": String($('#showButtonCheckbox').prop("checked"))
		}, function(opts){
		JSOptions.setItem("notifyInterval", JSON.parse(val));
		JSOptions.setItem("notifyFlag", JSON.parse($('#NotifyCheckbox').prop("checked")));
		JSOptions.setItem("showButton", JSON.parse($('#showButtonCheckbox').prop("checked")));
		chrome.alarms.clear("getNotify");
		chrome.alarms.create("getNotify", {periodInMinutes: JSOptions.getItem("notifyInterval")});
	});
}

function restore_options() {
	chrome.storage.sync.get(["notifyInterval", "notifyFlag", "showButton"], function (obj) {
		var interval;
		var checked;
		var showButton;

		if(obj.notifyInterval){
			interval = JSON.parse(obj.notifyInterval);
			$('#NotifyIntervalInput').val(String(interval));
		}
		else{
			interval = JSOptions.getItem("notifyInterval");
			$('#NotifyIntervalInput').val(String(interval));
			chrome.storage.sync.set({"notifyInterval": String(interval)}, function(opt){
				JSOptions.setItem("notifyInterval", JSON.parse(interval));
			});
		}

		if(obj.notifyFlag){
			checked = JSON.parse(obj.notifyFlag);
			$('#NotifyCheckbox').prop("checked", checked);
		}
		else{
			checked = JSOptions.getItem("notifyFlag");
			$('#NotifyCheckbox').prop("checked", checked);
			chrome.storage.sync.set({"notifyFlag": String(checked)}, function(opt){
				JSOptions.setItem("notifyFlag", JSON.parse(checked));
			});
		}

		if(obj.showButton){
			showButton = JSON.parse(obj.showButton);
			$('#showButtonCheckbox').prop("checked", showButton);
		}
		else{
			showButton = JSOptions.getItem("showButton");
			$('#showButtonCheckbox').prop("checked", showButton);
			chrome.storage.sync.set({"showButton": String(showButton)}, function(opt){
				JSOptions.setItem("showButton", JSON.parse(showButton));
			});
		}
	});
}


/**
 * Обработчик события загрузки страницы настроек
 */
$(document).ready(function(){

	$('#options_page_button_save_options').on('click', function() {
		save_options();
	});

	chrome.runtime.getBackgroundPage(function(b){
		JSOptions = b.JSOptions;
		/*#TODO*/
		//alert(JSON.stringify(JSOptions.get()));
		$('#NotifyIntervalInput').attr({"min": String(JSOptions.getItem("notifyIntervalMin"))});
		$('#NotifyIntervalInput').attr({"max": String(JSOptions.getItem("notifyIntervalMax"))});
		$('#options_page_showButtonCheckbox').text(chrome.i18n.getMessage("options_page_showButtonCheckbox"));
		$('#options_page_NotifyCheckbox').text(chrome.i18n.getMessage("options_page_NotifyCheckbox"));
		$('#options_page_NotifyIntervalInput').text(chrome.i18n.getMessage("options_page_NotifyIntervalInput"));
		$('#options_page_button_save_options_text').text(chrome.i18n.getMessage("options_page_button_save_options"));
		restore_options();
		save_options();
	});
});
