<?php

header("Access-Control-Allow-Origin: *");

if(isset($_GET["getscript"])) {
	
	header("Content-Type: application/javascript; charset=utf-8");

?>

/* JavaScript */

function addBookmarkInCheckitLink() {

	// в релизе убрать строку ниже
	console.log("[bookmarklet.php?getscript] - CHECKITLINK_SECRET_KEY: ", CHECKITLINK_SECRET_KEY);

	// если не удалось найти window.CHECKITLINK_SECRET_KEY на текущей странице
	// значит что-то не так и лучше от греха не продолжать
	if(!window.CHECKITLINK_SECRET_KEY) {
		// в релизе убрать строку ниже
		console.error("[bookmarklet.php?getscript] - CHECKITLINK_SECRET_KEY не найден на странице!");
		return false;
	}

	// найдем на странице наш фрейм и если он уже есть, то удалим к херам
	var CHECKITLINK_FRAME = document.getElementById("CHECKITLINK_FRAME");
	if(CHECKITLINK_FRAME){
		CHECKITLINK_FRAME.parentNode.removeChild(CHECKITLINK_FRAME);
	}

	// создаем iframe
	var CHECKITLINK_WIN_IFRAME = document.createElement("iframe");

	// id по которому если что его можно найти
	CHECKITLINK_WIN_IFRAME.setAttribute("id", "CHECKITLINK_FRAME");

	// установим адрес нашего фрейма
	// CHECKITLINK_WIN_IFRAME.setAttribute("src", "https://checkitlink.com/browser/bookmarklet");
	CHECKITLINK_WIN_IFRAME.setAttribute("src", "https://randomfio.xyz/test/bookmarklet.php");

	// установим имя фрейма (потом будем по нему обращаться)
	CHECKITLINK_WIN_IFRAME.setAttribute("name", "CHECKITLINK");

	// установим функцию, которая выполнится после загрузки фрейма
	CHECKITLINK_WIN_IFRAME.onload = timeoutLoad;

	// и размер 0, чтоб не отображался на странице
	CHECKITLINK_WIN_IFRAME.setAttribute("width", "0");
	CHECKITLINK_WIN_IFRAME.setAttribute("height", "0");

	// формируем данные для отправки
	var LINK_DATA_OBJECT = null;
	LINK_DATA_OBJECT = {
					// генерируем PHP кодом на странице пользователя
					SECRET_KEY: window.CHECKITLINK_SECRET_KEY, 
					// ну про action и говорить не стоит ))
					Aaction: "ADDURL", 
					// APPID для идентификации. Можно генерить сюда SECRET_KEY и отслеживать статистику
					APPID: "bookmarklet",
					// собственно данные ссылки
					args: {
						hashtag: [],
						// id категории "Другое"
						categori_id: JSON.stringify({
							cat_id: 8, 
							ch_cat_id: 0
						}),
						title: document.title,
						description: "",
						url: document.location.href,
						status: 0
					}
				}

	// в релизе убрать строку ниже
	console.log("[bookmarklet.php?getscript] - Начинаем отправку...");
	
	// добавляем iframe в конец текущей страницы
	document.body.appendChild(CHECKITLINK_WIN_IFRAME);

	// функция методом postMessage отправит объект данных в фрейм
	function timeoutLoad(){
		// отправляем данные в наш фрейм
		var CHECKITLINK_WIN = window.frames.CHECKITLINK;
		CHECKITLINK_WIN.postMessage(JSON.stringify(LINK_DATA_OBJECT), "*");

		// в релизе убрать строку ниже
		console.log("[bookmarklet.php?getscript] - Отправлено: %s", JSON.stringify(LINK_DATA_OBJECT));
	}
}

function receiveMessage(event){
	// если ответа из фрейма нет
	if (!event.data){
		return;
	}
	// если ответ не object, а другой тип данных
	if(typeof event.data !== 'object'){
		return;
	}
	// если у объекта есть свойство CHECKITLINK_MESSAGE
	if("CHECKITLINK_MESSAGE" in event.data) {
		var message = event.data.CHECKITLINK_MESSAGE;
	}
	else {
		return;
	}
	// в релизе убрать строку ниже
	console.log("[bookmarklet.php?getscript (ответ из фрейма через postMessage)] - ", message);

	// найдем на странице наш div с уведомлением и если он уже есть, то удалим к херам =)
	var div = document.getElementById("CHECKITLINK_DIV");
	if(div){
		div.parentNode.parentNode.removeChild(div.parentNode);
	}

	// создаем уведомление
	var CHECKITLINK_DIV = document.createElement("div");
	CHECKITLINK_DIV.innerHTML = '<div id="CHECKITLINK_DIV" style="width: 100% !important; position: fixed; top: 0; left: 0; display: none; z-index: 9999999999 !important; background-color: #ffffff !important; border: 1px solid #000000 !important;"><div style="float: left; vertical-align: middle; width: 50%; height: 100%;"><img src="https://checkitlink.com/img/logonew.png"></div><div style="height: 100%; vertical-align: middle;"><h2>'+message+'</h2></div></div>';
	document.body.insertBefore(CHECKITLINK_DIV, document.body.children[0]);

	document.getElementById("CHECKITLINK_DIV").style.display = "block";

	setTimeout(function(){
		var div = document.getElementById("CHECKITLINK_DIV");
		//div.style.display = "none";
		div.parentNode.parentNode.removeChild(div.parentNode);
	}, 5000);
}

// назначаем слушателя входящего сообщения
if (window.addEventListener) {
	window.addEventListener("message", receiveMessage);
}
else {
	// IE8
	window.attachEvent("onmessage", receiveMessage);
}


// собственно вызов функции =)
addBookmarkInCheckitLink();

/* JavaScript */

<?php 

	exit; 

}

?>

<!DOCTYPE html>
<html lang="ru">
	<head>
		<meta charset="utf-8">
		<script type="text/javascript" src="https://code.jquery.com/jquery-2.2.0.js"></script>
	</head>
	<body>

		<script type="text/javascript">
			// функция-слушатель входящего сообщения
			function listener(event) {
				var LINK_DATA_OBJECT = event.data;
				if(LINK_DATA_OBJECT) {
					// формируем данные для отправки
					var data = {
						type: "GET",
						url: "https://checkitlink.com/browser/addlink",
						dataType: 'json',
						data: {
							request: LINK_DATA_OBJECT
						},
						success: function(res){
							// в релизе убрать строку ниже
							console.log("[bookmarklet.php] - Успешная отправка! Ответ сервера: %s", res.response);
							if (res.response.code == 200) {
								// отправим ответ в родительское окно
								event.source.postMessage({CHECKITLINK_MESSAGE: res.response.message}, "*");
							}
						},
						error: function(jqXHR, textStatus, errorThrown){
							// в релизе убрать строку ниже
							console.log("[bookmarklet.php] - Ошибка отправки! Ответ сервера: %s", jqXHR.responseText);
							// отправим ответ в родительское окно
							event.source.postMessage({CHECKITLINK_MESSAGE: jqXHR.responseText}, "*");
						}
					}

					// отправляем обработчику
					$.ajax(data);
				}
				else{
					// в релизе убрать строку ниже
					console.log("[bookmarklet.php] - На странице не найден объект ссылки!");
					// отправим ответ в родительское окно
					event.source.postMessage({CHECKITLINK_MESSAGE: "Не найден объект ссылки!"}, "*");
				}
			}

			// назначаем слушателя входящего сообщения
			if (window.addEventListener) {
				window.addEventListener("message", listener);
			}
			else {
				// IE8
				window.attachEvent("onmessage", listener);
			}
		</script>
	</body>
</html>