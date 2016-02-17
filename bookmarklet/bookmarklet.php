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

	// создаем iframe
	var CHECKITLINK_WIN_IFRAME = document.createElement("iframe");

	// установим адрес нашего фрейма
	// CHECKITLINK_WIN_IFRAME.src = "https://checkitlink.com/browser/bookmarklet";
	CHECKITLINK_WIN_IFRAME.src = "https://randomfio.xyz/test/bookmarklet.php";

	// установим имя фрейма (потом будем по нему обращаться)
	CHECKITLINK_WIN_IFRAME.name = "CHECKITLINK";

	// установим функцию, которая выполнится после загрузки фрейма
	CHECKITLINK_WIN_IFRAME.onload = timeoutLoad;

	// и размер 0, чтоб не отображался на странице
	CHECKITLINK_WIN_IFRAME.width = 0;
	CHECKITLINK_WIN_IFRAME.height = 0;

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
	if (!event.data){
		return;
	}
	try {
		var message = JSON.parse(event.data);
		message = message.CHECKITLINK_MESSAGE;
	}
	catch(err){
		return;
	}
	// в релизе убрать строку ниже
	console.log("[bookmarklet.php?getscript (ответ из фрейма через postMessage)] - ", event.data);

	var CHECKITLINK_DIV = document.createElement("div");
	CHECKITLINK_DIV.innerHTML = '<div id="CHECKITLINK_DIV" style="width: 100%; display: none;"><div style="float: left; width: 50%; height: 100%;"><img src="data:image/png;base64,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"></div><div style="height: 100%;"><h2>'+event.data+'</h2></div></div>';
	document.body.insertBefore(CHECKITLINK_DIV, document.body.children[0]);

	document.getElementById("CHECKITLINK_DIV").style.display = "block";

	setTimeout(function(){
		document.getElementById("CHECKITLINK_DIV").style.display = "none";
	}, 10000);
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
						type: "POST",
						url: "https://checkitlink.com/browser/addlink",
						dataType: 'json',
						data: {
							request: LINK_DATA_OBJECT
						},
						success: function(res){
							// в релизе убрать строку ниже
							console.log("[bookmarklet.php] - Успешная отправка! Ответ сервера: %s", res.response.message);
							// отправим ответ в родительское окно
							event.source.postMessage(JSON.stringify({CHECKITLINK_MESSAGE: "res.response.message"}), "*");
						},
						error: function(jqXHR, textStatus, errorThrown){
							// в релизе убрать строку ниже
							console.log("[bookmarklet.php] - Ошибка отправки! Ответ сервера: %s", jqXHR.responseText);
							// отправим ответ в родительское окно
							event.source.postMessage(JSON.stringify({CHECKITLINK_MESSAGE: "jqXHR.responseText"}), "*");
						}
					}

					// отправляем обработчику
					// СУКА!!!!!!!!! ВСЕ РАБОТАЕТ КРОМЕ ЭТОГОЙ ОТПРАВКИ КРОССДОМЕННО!!!!!!!!!!!!!
					$.ajax(data);
				}
				else{
					// в релизе убрать строку ниже
					console.log("[bookmarklet.php] - На странице не найден объект ссылки!");
					// отправим ответ в родительское окно
					event.source.postMessage(JSON.stringify({CHECKITLINK_MESSAGE: "Не найден объект ссылки!"}), "*");
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