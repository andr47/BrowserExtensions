// extForms.js

// объект html форм для отображения
var extForms = {
	/*
	*	Форма для добавления ссылки	
	*/
	addUrlForm: {
		/*
		*	HTML код формы
		*/
		html: '<div class="container-fluid">'+
					'<form id="addurl-form">'+

						'<div id="my_chrome_app_div_spinner" class="pull-right"><img id="my_chrome_app_spinner" /></div>'+
						'<br><div class="alert alert-success" style="display: none;" id="add_url_alert">'+
							'<section></section>'+
						'</div>'+

						'<div class="row">'+
							'<div class="col-xs-8">'+
								'<label class="pull-left">'+chrome.i18n.getMessage("addurl_formurl")+':</label>'+
								'<input type="text" class="form-control" name="url" id="addurl-form_url">'+
							'</div>'+
							'<div class="col-xs-4">'+
								'<label class="pull-left">'+chrome.i18n.getMessage("addurl_formcategori_id")+':</label>'+
								'<select class="form-control" name="categori_id" id="addurl-form_categori_id"></select>'+
							'</div>'+
						'</div>'+

						'<div class="row">'+
							'<div class="col-xs-12">'+
								'<label class="pull-left">'+chrome.i18n.getMessage("addurl_formtitle")+':</label>'+
								'<input type="text" class="form-control" name="title" id="addurl-form_title">'+
							'</div>'+
						'</div>'+

						'<div class="row">'+
							'<div class="col-xs-12">'+
								'<label class="pull-left">'+chrome.i18n.getMessage("addurl_formdescription")+':</label>'+
								'<textarea class="form-control" name="description" id="addurl-form_description" rows="3"></textarea>'+
							'</div>'+
							'<div class="col-xs-12">'+
								'<label class="pull-left">'+chrome.i18n.getMessage("addurl_formhashtag")+':</label><br>'+
								'<input type="text" class="form-control" name="hashtag" id="addurl-form_hashtag">'+
							'</div>'+
						'</div>'+

						'<div class="row">'+
							'<div class="col-xs-4">'+
								'<label class="pull-left">'+chrome.i18n.getMessage("addurl_formstatus")+':</label>'+
								'<select class="form-control" name="status" id="addurl-form_status">'+
									'<option value="0">'+chrome.i18n.getMessage("addurl_formstatus0")+'</option>'+
									'<option value="1">'+chrome.i18n.getMessage("addurl_formstatus1")+'</option>'+
								'</select>'+
							'</div>'+
						'</div>'+

						'<br><div class="row">'+
							'<div class="col-xs-12">'+
								'<button type="button" class="btn btn-success pull-left" name="submit_addurl" id="addurl-form_submit_addurl-form"><span class="glyphicon glyphicon-pushpin"></span> '+chrome.i18n.getMessage("addurl_formsubmit")+'</button>'+

								'<span class="form-group pull-right">'+
									'<div class="btn-group dropup">'+
										'<button type="button" class="btn btn-info dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+
											'<span class="glyphicon glyphicon-cloud-upload"></span> '+chrome.i18n.getMessage("export")+' <span class="caret"></span>'+
										'</button>'+
										'<ul class="dropdown-menu">'+
										    '<li><a id="addurl-form_go_export_addurl-form" href="#">'+chrome.i18n.getMessage("addUrlToBookmarks_menu_item2")+'</a></li>'+
										    '<li><a id="addurl-form_go_export_addurl-file" href="#">'+chrome.i18n.getMessage("addUrlToBookmarks_menu_item3")+'</a></li>'+
										'</ul>'+
									'</div>'+
								'</span>'+

							'</div>'+
						'</div>'+

					'</form>'+
				'</div>'
	},
	
	/*
	*	Форма для добавления SECRET_KEY	
	*/
	addSecretKeyForm: {
		/*
		*	HTML код формы
		*/
		html: '<div class="container-fluid">'+
					'<form id="secret_key-form">'+
						'<br><div class="form-group">'+
							'<div class="alert alert-success" style="display: none;" id="secret_key_alert">'+
								'<section></section>'+
							'</div>'+
							'<div id="my_chrome_app_div_spinner" class="pull-right"><img id="my_chrome_app_spinner" /></div>'+
						'</div>'+
						'<div class="form-group">'+
							'<label class="pull-left" for="secret_key-form_SECRET_KEY">'+chrome.i18n.getMessage("secret_key_formSECRET_KEY")+':</label>'+
							'<input type="password" class="form-control" name="SECRET_KEY" id="secret_key-form_SECRET_KEY">'+
							'<span id="show_password" title="'+chrome.i18n.getMessage("secret_key_formshow_password")+'"><span class="glyphicon glyphicon-eye-open"></span></span>'+
						'</div>'+
						'<div class="form-group pull-right">'+
							'<button type="button" class="btn btn-success" name="submit_secretkey" id="secret_key-form_submit_secret_key-form"><span class="glyphicon glyphicon-user"></span> '+chrome.i18n.getMessage("secret_key_formsubmit")+'</button>'+
						'</div>'+
					'</form>'+
				'</div>'
	},
	
	/*
	*	HTML уведомление о том, что нет подключения к интернету
	*/
	NetStatusAlert: {
		/*
		*	HTML код формы
		*/
		html: '<br><div class="alert alert-danger alert-dismissible" role="alert" id="NetStatusAlert">'+
					'<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
					'<strong>'+chrome.i18n.getMessage("networkAlert")+'</strong>'+
				'</div>'
	}
}