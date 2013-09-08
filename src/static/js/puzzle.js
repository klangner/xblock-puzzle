function PuzzleBlock(runtime, element) {
	console.log('init');
	$('.puzzleButton').click(function button_clicked() {
		$.ajax({
			type: "POST",
	        url: runtime.handler_url('button_clicked'),
	        data: JSON.stringify({watched: true}),
	        success: function(result) {
	        	console.log(result);
	        }
	    });
	});
}