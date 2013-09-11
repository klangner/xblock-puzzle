function PuzzleBlock(runtime, element) {

	/** Run puzzle */
	const testModel = {	
		width: %d,
		height: %d,
		columns: %d,
		rows: %d
	}
	
	var presenter = new PuzzlePresenter(testModel, $(element).find(".puzzle-module:first"));
	presenter.refresh();
	connectButtonHandlers($(element).find(".puzzle-buttons:first"), presenter);
	
	/**
	 * Presenter responsible for logic of the puzzle module
	 */
	function PuzzlePresenter(model, view){
		
		const _model = validateModel(model);
		const _view = initView(view, _model);
		const pieceWidth = _model.width/_model.columns;
		const pieceHeight = _model.height/_model.rows;
		var _selectedPiece = null;
		/** Contains current pieces order */
		var _currentOrder = [];
		
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
		this.getPiecesOrder = function(){
			return _currentOrder;
		}
		
		/** Ensure that model has valid parameters */
		function validateModel(model){
			return {
				width: model.width || 640,
				height: model.height || 480,
				columns: model.columns || 4,
				rows: model.rows || 4
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
			swap(_currentOrder, piece1.order, piece2.order);
		}

		function swap(list, index1, index2){
			var tmp = list[index1]; 
			list[index1] = list[index2];
			list[index2] = tmp;
		}
	}
	
	
	function connectButtonHandlers(button_panel, presenter){
		var checkButton = $(button_panel.find("button")[0]);
		checkButton.click(function() {
			console.log("Order: " + presenter.getPiecesOrder());
		});
	}
	
	/**
	 * Utility functions
	 */
	function existy(x) { return x!= null};
	function truthy(x) { return (x !== false) && existy(x)};
}