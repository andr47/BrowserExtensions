// content.js

// текущий объект картинки
var CURRENT_IMAGE;

// хранилище размера экрана
var windowSize = {
    "width": 900,
    "height": 600
};

// хранилище настроек
var JSOptions = {
	"showButton": false
};

// функция подгружает настройки из background.js
function getOptions(){
	var params = {
		"sender": "contentScript",
		"action": "GETOPTIONS"
	}
	chrome.extension.sendMessage(params);	
}
getOptions();

// слушаем сообщения из background.js
chrome.extension.onMessage.addListener(function(msg, sender, sendResponse){
	if (msg.sender == "backgroundScript"){
		if (msg.status == 1){
			// все ОК
			if (msg.opts){
				JSOptions = msg.opts;
			}
			else if (msg.showButton){
				JSOptions.showButton = msg.showButton;
			}
		}
		else{
			// что-то не так
		}
	}
	else{
		// не от background.js
	}
});

// формируем объект данных о картинке и отправляем в background.js
function CheckItLinkClick(){
	// отменяем дефолтное поведение на случай если картинка == ссылка, чтоб не перейти при нажатии на нашу кнопку
	event.preventDefault();
	$(".CheckItLink_Button").hide();
	var img = $(CURRENT_IMAGE);
	var u = new URL(img.attr('src'));
	var imgInfo = {
		"sender": "contentScript",
		"action": "ADDIMAGE",
		"srcUrl": u.href,
		"pageUrl": document.location.href,
		"pageTitle": $("title").text(),
		"imgWidth": img.width(),
		"imgHeight": img.height(),
		"windowSize": windowSize
	}
	/*#TODO*/
	//alert(JSON.stringify(imgInfo, null, "\t"));
	chrome.extension.sendMessage(imgInfo);
}


$(document).ready(function(){

	$('body').prepend("<span title='Сохранить в CheckItLink' class='CheckItLink_Button'></span>");

	// минимальная ширина картинки
	var minw = 80;
	// минимальная высота картинки
	var minh = 80;

	$(".CheckItLink_Button").on("click", function(){
		CheckItLinkClick();
	});

	$('body')
		.on("mouseenter", 'img', function(){
			getOptions();
			CURRENT_IMAGE = this;
			var pos = getOffset(this);
			var width = $(this).width();
			var height = $(this).height();
			var top = (pos.top+5);
			var img = $(CURRENT_IMAGE);
			var left = (pos.left+(img.width()-32-5));

			// если картинка меньше минимальных настроек, то не обрабатываем наведение курсора
			if(width < minw || height < minh) return false;
			// Проверка настройки
			if(JSOptions.showButton){
				$(".CheckItLink_Button")
					.stop(true, true)
					.css({"top": top, "left": left})
					.animate({opacity:'show'}, 300);
			}
		});
	$('body')
		.on("mouseleave", 'img', function(){
			$(".CheckItLink_Button")
				.animate({opacity:'hide'}, 100)
				.stop(true, true);
		});

});

$(window).on('load resize', function(){

	$(".CheckItLink_Button").hide();

	windowSize = {
	    "width": $(window).width(),
	    "height": $(window).height()
	}
});
