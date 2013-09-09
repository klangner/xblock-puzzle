function PuzzleBlock(runtime, element) {
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