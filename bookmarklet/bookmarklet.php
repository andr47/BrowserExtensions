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