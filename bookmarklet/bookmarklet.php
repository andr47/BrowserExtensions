<?php

if(isset($_GET["getscript"])) {
	
	header("Content-Type: application/javascript; charset=utf-8");

?>

/* JavaScript */

function addBookmarkInCheckitLink() {

	// в релизе убрать строку ниже
	console.log("CHECKITLINK_SECRET_KEY: ", CHECKITLINK_SECRET_KEY);

	// если не удалось найти window.CHECKITLINK_SECRET_KEY на текущей странице
	// значит что-то не так и лучше от греха не продолжать
	if(!window.CHECKITLINK_SECRET_KEY) {
		// в релизе убрать строку ниже
		console.error("CHECKITLINK_SECRET_KEY не найден на странице!");
		return false;
	}

	// создаем iframe
	var CHECKITLINK_WIN_IFRAME = document.createElement("iframe");

	// установим адрес нашего фрейма
	CHECKITLINK_WIN_IFRAME.src = "https://checkitlink.com/browser/bookmarklet";

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
					action: "ADDURL", 
					// APPID для идентификации. Можно генерить сюда SECRET_KEY и отслеживать статистику
					APPID: "bookmarklet",
					// собственно данные ссылки
					args: {
						hashtag: [],
						// id категории "Другое"
						categori_id: 8,
						title: document.title,
						description: "",
						url: document.location.href,
						status: 0
					}
				}

	// в релизе убрать строку ниже
	console.log("Начинаем отправку...");
	
	// добавляем iframe в конец текущей страницы
	document.body.appendChild(CHECKITLINK_WIN_IFRAME);

	// функция методом postMessage отправит объект данных в фрейм
	function timeoutLoad(){
		// отправляем данные в наш фрейм
		var CHECKITLINK_WIN = window.frames.CHECKITLINK;
		CHECKITLINK_WIN.postMessage(JSON.stringify(LINK_DATA_OBJECT), "*");

		// в релизе убрать строку ниже
		console.log("Отправлено: %s", JSON.stringify(LINK_DATA_OBJECT));
	}


}

// собственно вызов функции =)
addBookmarkInCheckitLink();

/* JavaScript */

<?php 

	exit; 

}

?>

<?php 

	header("Access-Control-Allow-Origin: *");
	header("Access-Control-Allow-Credentials: true ");

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
							// если код 200, то добавлено
							alert(res.response.message);
						},
						error: function(jqXHR, textStatus, errorThrown){
							alert(jqXHR.responseText);
						}
					}

					// отправляем обработчику
					$.ajax(data);
				}
				else {
					alert("ОШИБКА:" + LINK_DATA_OBJECT);
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