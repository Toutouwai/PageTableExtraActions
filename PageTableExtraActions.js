var pt_fields = {};

$(function() {
	// Handle click of action button
	var spinner = '<div class="spin-outer"><i class="ui-priority-secondary fa fa-fw fa-spin fa-spinner"></i></div>';
	$('.InputfieldPageTable').on('click', '.pt-action', function() {
		var $pt_field = $(this).closest('.InputfieldPageTable');
		var href = $(this).attr('href');
		var actionName = href.match(/[\?&]action=([-_a-zA-Z0-9]+)/)[1];
		var pageID = parseInt(href.match(/[\?&]id=([0-9]+)/)[1]);
		var post_token = $('._post_token').first();
		var token_name = post_token.attr('name');
		var token_value = post_token.attr('value');
		var postData = {
			action: actionName,
			id: pageID
		};
		postData[token_name] = token_value;
		var $container = $pt_field.find('.InputfieldPageTableContainer');
		$(this).parent('.pt-actions').html(spinner);

		$.post(href + '&render=json', postData, function(data) {
			if(data.success) {
				var ajaxURL = $container.attr('data-url');
				$.get(ajaxURL, function(data) {
					$container.html(data);
					$container.find(".Inputfield").trigger('reloaded', ['InputfieldPageTable']);
					$container.effect('highlight', 500, function() {
						var $table = $container.find('table');
						$table.find('tbody').css('overflow', 'visible');
						InputfieldPageTableSortable($table);

						// restore appearance of any items marked for deletion
						var deleteIDs = $container.siblings("input.InputfieldPageTableDelete").eq(0).val().split('|');
						if(deleteIDs.length) {
							for(var n = 0; n < deleteIDs.length; n++) {
								var deleteID = deleteIDs[n];
								$table.find("tr[data-id=" + deleteID + "]")
									.addClass('InputfieldPageTableDelete ui-state-error-text ui-state-disabled');
							}
						}
					});
					attachExtraActions();
				});
			} else {
				// data.success === false, so display error
				data = $.parseJSON(data);
				ProcessWire.alert(data.message);
			}
		});

		return false;
	});

	attachExtraActions();
	$(document).ajaxComplete(function() {
		attachExtraActions();
	});

});

// Attach extra actions
function attachExtraActions() {
	$.each(pt_fields, function(f_name, rows) {
		var $pt_field = $('#wrap_Inputfield_' + f_name);
		$.each(rows, function(id, actions) {
			var $row = $pt_field.find('tr[data-id="' + id + '"]');
			var str = '';
			$.each(actions, function(key, action) {
				str += '<a class="pt-action action-' + key + '" title="' + action['name'] + '" href="' + action['url'] + '">' + action['name'] + '</a>';
			});
			$row.find('td:nth-last-child(2)').addClass('pt-actions').html(str);
		});
	});
}
