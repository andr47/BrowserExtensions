(function($) {
	
	$.alerts = {
		
		// These properties can be read/written by accessing $.alerts.propertyName from your scripts at any time
		
		verticalOffset: -75,                // vertical offset of the dialog from center screen, in pixels
		horizontalOffset: 0,                // horizontal offset of the dialog from center screen, in pixels/
		repositionOnResize: true,           // re-centers the dialog on window resize
		overlayOpacity: .01,                // transparency level of overlay
		overlayColor: '#FFF',               // base color of overlay
		draggable: true,                    // make the dialogs draggable (requires UI Draggables plugin)
		okButton: chrome.i18n.getMessage("buttonYES"),         // text for the OK button
		cancelButton: chrome.i18n.getMessage("buttonNO"), // text for the Cancel button
		dialogClass: null,                  // if specified, this class will be applied to all dialogs
		
		// Public methods
		
		alert: function(message, title, callback) {
			if( title == null ) title = 'Alert';
			$.alerts._show(title, message, null, 'alert', function(result) {
				if( callback ) callback(result);
			});
		},
		
		confirm: function(message, title, callback) {
			if( title == null ) title = 'Confirm';
			$.alerts._show(title, message, null, 'confirm', function(result) {
				if( callback ) callback(result);
			});
		},
			
		prompt: function(message, value, title, callback) {
			if( title == null ) title = 'Prompt';
			$.alerts._show(title, message, value, 'prompt', function(result) {
				if( callback ) callback(result);
			});
		},
		
		// Private methods
		
		_show: function(title, msg, value, type, callback) {
			
			$.alerts._hide();
			$.alerts._overlay('show');
			
			$("BODY").append(
			  '<div id="jQueryAlerts_popup_container">' +
			    '<h1 id="jQueryAlerts_popup_title"></h1>' +
			    '<div id="jQueryAlerts_popup_content">' +
			      '<div id="jQueryAlerts_popup_message"></div>' +
				'</div>' +
			  '</div>');
			
			if( $.alerts.dialogClass ) $("#jQueryAlerts_popup_container").addClass($.alerts.dialogClass);
			
			// IE6 Fix
			var pos = 'absolute'; 
			
			$("#jQueryAlerts_popup_container").css({
				position: pos,
				zIndex: 99999,
				padding: 0,
				margin: 0
			});
			
			$("#jQueryAlerts_popup_title").text(title);
			$("#jQueryAlerts_popup_content").addClass(type);
			$("#jQueryAlerts_popup_message").text(msg);
			$("#jQueryAlerts_popup_message").html( $("#jQueryAlerts_popup_message").text().replace(/\n/g, '<br />') );
			
			$("#jQueryAlerts_popup_container").css({
				minWidth: $("#jQueryAlerts_popup_container").outerWidth(),
				maxWidth: $("#jQueryAlerts_popup_container").outerWidth()
			});
			
			$.alerts._reposition();
			$.alerts._maintainPosition(true);
			
			switch( type ) {
				case 'alert':
					$("#jQueryAlerts_popup_message").after('<div id="jQueryAlerts_popup_panel"><input type="button" value="' + $.alerts.okButton + '" id="jQueryAlerts_popup_ok" /></div>');
					$("#jQueryAlerts_popup_ok").click( function() {
						$.alerts._hide();
						callback(true);
					});
					$("#jQueryAlerts_popup_ok").focus().keypress( function(e) {
						if( e.keyCode == 13 || e.keyCode == 27 ) $("#jQueryAlerts_popup_ok").trigger('click');
					});
				break;
				case 'confirm':
					$("#jQueryAlerts_popup_message").after('<div id="jQueryAlerts_popup_panel"><input type="button" value="' + $.alerts.okButton + '" id="jQueryAlerts_popup_ok" /> <input type="button" value="' + $.alerts.cancelButton + '" id="jQueryAlerts_popup_cancel" /></div>');
					$("#jQueryAlerts_popup_ok").click( function() {
						$.alerts._hide();
						if( callback ) callback(true);
					});
					$("#jQueryAlerts_popup_cancel").click( function() {
						$.alerts._hide();
						if( callback ) callback(false);
					});
					$("#jQueryAlerts_popup_ok").focus();
					$("#jQueryAlerts_popup_ok, #jQueryAlerts_popup_cancel").keypress( function(e) {
						if( e.keyCode == 13 ) $("#jQueryAlerts_popup_ok").trigger('click');
						if( e.keyCode == 27 ) $("#jQueryAlerts_popup_cancel").trigger('click');
					});
				break;
				case 'prompt':
					$("#jQueryAlerts_popup_message").append('<br /><input type="text" size="30" id="jQueryAlerts_popup_prompt" />').after('<div id="jQueryAlerts_popup_panel"><input type="button" value="' + $.alerts.okButton + '" id="jQueryAlerts_popup_ok" /> <input type="button" value="' + $.alerts.cancelButton + '" id="jQueryAlerts_popup_cancel" /></div>');
					$("#jQueryAlerts_popup_prompt").width( $("#jQueryAlerts_popup_message").width() );
					$("#jQueryAlerts_popup_ok").click( function() {
						var val = $("#jQueryAlerts_popup_prompt").val();
						$.alerts._hide();
						if( callback ) callback( val );
					});
					$("#jQueryAlerts_popup_cancel").click( function() {
						$.alerts._hide();
						if( callback ) callback( null );
					});
					$("#jQueryAlerts_popup_prompt, #jQueryAlerts_popup_ok, #jQueryAlerts_popup_cancel").keypress( function(e) {
						if( e.keyCode == 13 ) $("#jQueryAlerts_popup_ok").trigger('click');
						if( e.keyCode == 27 ) $("#jQueryAlerts_popup_cancel").trigger('click');
					});
					if( value ) $("#jQueryAlerts_popup_prompt").val(value);
					$("#jQueryAlerts_popup_prompt").focus().select();
				break;
			}
			
			// Make draggable
			if( $.alerts.draggable ) {
				try {
					$("#jQueryAlerts_popup_container").draggable({ handle: $("#jQueryAlerts_popup_title") });
					$("#jQueryAlerts_popup_title").css({ cursor: 'move' });
				} catch(e) { /* requires jQuery UI draggables */ }
			}
		},
		
		_hide: function() {
			$("#jQueryAlerts_popup_container").remove();
			$.alerts._overlay('hide');
			$.alerts._maintainPosition(false);
		},
		
		_overlay: function(status) {
			switch( status ) {
				case 'show':
					$.alerts._overlay('hide');
					$("BODY").append('<div id="jQueryAlerts_popup_overlay"></div>');
					$("#jQueryAlerts_popup_overlay").css({
						position: 'absolute',
						zIndex: 99998,
						top: '0px',
						left: '0px',
						width: '100%',
						height: $(document).height(),
						background: $.alerts.overlayColor,
						opacity: $.alerts.overlayOpacity
					});
				break;
				case 'hide':
					$("#jQueryAlerts_popup_overlay").remove();
				break;
			}
		},
		
		_reposition: function() {
			var top = (($(window).height() / 2) - ($("#jQueryAlerts_popup_container").outerHeight() / 2)) + $.alerts.verticalOffset;
			var left = (($(window).width() / 2) - ($("#jQueryAlerts_popup_container").outerWidth() / 2)) + $.alerts.horizontalOffset;
			if( top < 0 ) top = 0;
			if( left < 0 ) left = 0;
			
			
			$("#jQueryAlerts_popup_container").css({
				top: top + 'px',
				left: left + 'px'
			});
			$("#jQueryAlerts_popup_overlay").height( $(document).height() );
		},
		
		_maintainPosition: function(status) {
			if( $.alerts.repositionOnResize ) {
				switch(status) {
					case true:
						$(window).bind('resize', $.alerts._reposition);
					break;
					case false:
						$(window).unbind('resize', $.alerts._reposition);
					break;
				}
			}
		}
		
	}
	
	// Shortuct functions
	jAlert = function(message, title, callback) {
		$.alerts.alert(message, title, callback);
	}
	
	jConfirm = function(message, title, callback) {
		$.alerts.confirm(message, title, callback);
	};
		
	jPrompt = function(message, value, title, callback) {
		$.alerts.prompt(message, value, title, callback);
	};
	
})(jQuery);