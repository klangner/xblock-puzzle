function PuzzleBlock(runtime, element) {

	const model = loadModel($(element).find(".puzzle-data:first"));
	var presenter = new PuzzlePresenter(model, $(element).find(".puzzle-module:first"));
	presenter.refresh();
	connectButtonHandlers($(element).find(".puzzle-buttons:first"), presenter, model);

	
	/**
	 * Load model from html div data
	 */
	function loadModel(div){
		return eval('(' + div.text() + ')');
	}
	
	/**
	 * Presenter responsible for logic of the puzzle module
	 */
	function PuzzlePresenter(model, view){
		
		const _model = validateModel(model);
		const _view = initView(view, _model);
		const pieceWidth = _model.width/_model.columns;
		const pieceHeight = _model.height/_model.rows;
		var _selectedPiece = null;
		
		/**
		 * Reload puzzle.
		 */
		this.refresh = function(){
			removeAllPieces();
			createAllPieces();
		}
		
		/**
		 * Return current order of pieces
		 */
		this.getPieces = function(){
			return _.map(_view.children(), getPieceData);
		}
		
		/** Ensure that model has valid parameters */
		function validateModel(model){
			return {
				width: model.width > 10 ? model.width : 640,
				height: model.height > 10 ? model.height : 480,
				columns: model.columns > 1 ? model.columns : 4,
				rows: model.rows > 1 ? model.rows : 4,
				image: model.image + "&" + new Date().getTime()
			};
		}
		
		function initView(view, model){
			return view.css({width: model.width + "px", height: model.height + "px"});
		}
		
		function removeAllPieces(){
			_view.children().remove();
			_selectedPiece = null;
			_currentOrder = [];
		}
		
		function createAllPieces(){
			for(var i = 0; i < _model.rows; i++){
				for(var j = 0; j < _model.columns; j++){
					var piece = createPiece(i, j);
					_view.append(piece);
					_currentOrder.push(piece.order);
				}
			}
		}
		
		function createPiece(row, column){
			var piece = $(document.createElement("div"));
			piece.order = column + row*_model.columns;
            piece.addClass('puzzle-piece');
            piece.css({
            	left: pieceWidth*column + "px",
                top: pieceHeight*row + "px",
                width: pieceWidth + 'px',
                height: pieceHeight + 'px',
                backgroundImage: "url('" + _model.image + "')",
                backgroundSize: _model.width + "px " + model.height + "px",
                backgroundPosition: (column*-pieceWidth) + "px " + (row*-pieceHeight) + "px"
            });
            piece.click(function(){pieceClicked(piece);});
            return piece;
		}
		
		function pieceClicked(piece){
			if(existy(_selectedPiece)){
				_selectedPiece.removeClass('puzzle-piece-selected');
				if(_selectedPiece != piece) replacePiecesPosition(_selectedPiece, piece);
				_selectedPiece = null;
			}
			else{
				_selectedPiece = piece;
				_selectedPiece.addClass('puzzle-piece-selected');
			}
		}
		
		function replacePiecesPosition(piece1, piece2){
			var left1 = piece1.css('left');
			var top1 = piece1.css('top');
			piece1.css({left:piece2.css('left'), top:piece2.css('top')});
			piece2.css({left:left1, top:top1});
		}

		function getPieceData(element){
			var piece = $(element);
			piece.row = Math.floor((piece.position().top+1) / piece.height());
			piece.col = Math.floor((piece.position().left+1) / piece.width());
			return piece;
		}
	}
	
	
	function connectButtonHandlers(button_panel, presenter, model){
		var checkButton = $(button_panel.find("button")[0]);
		checkButton.click(function() {
			var column_count = model.columns;
			var order = _.map(presenter.getPieces(), function(p){return p.row*column_count + p.col});
			console.log(order);
			$.ajax({
				type: "POST",
		        url: runtime.handler_url('check'),
		        data: JSON.stringify(order),
		        success: function(response) {
		        	console.log(response);
		            result = eval(response);
		            showFeedback(result.score, result.errors);
		        }
			});		
		});

		function showFeedback(score, errors){
			var feedbackPanel = button_panel.find(".puzzle-feedback:first");
			if(score > 0) feedbackPanel.text('Correct!');
			else feedbackPanel.text('Sorry there are ' + _.size(errors) + " errors.");
		}
	}
	
	
	/**
	 * Utility functions
	 */
	function existy(x) { return x!= null};
	function truthy(x) { return (x !== false) && existy(x)};
}