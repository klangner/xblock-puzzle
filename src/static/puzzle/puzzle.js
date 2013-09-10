function PuzzleBlock(runtime, element) {

	/** Run puzzle */
	const view = $('.puzzle-container') 
	const model = {	
		'Image':'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Puzzle-historical-map-1639.JPG/320px-Puzzle-historical-map-1639.JPG',
		'width': 640,
		'height': 480,
		'cols':4,
		'rows':4
	}
	const puzzleActivity = new PuzzlePresenter(view, model);

	/** 
	 * Connect buttons to send result to the server 
	 */
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
	
	
	/** 
	 * Puzzle presenter class  
	 */
	function PuzzlePresenter(puzzleView, puzzleModel) {

	    const view = puzzleView;
	    const model = puzzleModel;
        const intPuzzleWidth = model.width;
        const intPuzzleHeight = model.height;

	    var board = []; // Array that will hold the 2-dimensional representation of the board.
	    var indexBoard = [];
	
	    var animation = false;
	    var clickNumber = 0; //Check if this is first or second click
	
	    //Keep data from first click
	    var PieceOld;
	    var PiecePos;
	    var PiecePos2;
	
	    var puzzleWidth = 0;
	    var puzzleOuterWidth = 0;
	    var puzzleHeight = 0;
	    var puzzleOuterHeight = 0;
	    var leftOffset = 0;
	    var topOffset = 0;
	    var puzzle = null;
	    var mark;
	
	    function getElementDimensions(element) {
	        element = $(element);
	
	        return {
	            border:{
	                top:parseInt(element.css('border-top-width'), 10),
	                bottom:parseInt(element.css('border-bottom-width'), 10),
	                left:parseInt(element.css('border-left-width'), 10),
	                right:parseInt(element.css('border-right-width'), 10)
	            },
	            margin:{
	                top:parseInt(element.css('margin-top'), 10),
	                bottom:parseInt(element.css('margin-bottom'), 10),
	                left:parseInt(element.css('margin-left'), 10),
	                right:parseInt(element.css('margin-right'), 10)
	            },
	            padding:{
	                top:parseInt(element.css('padding-top'), 10),
	                bottom:parseInt(element.css('padding-bottom'), 10),
	                left:parseInt(element.css('padding-left'), 10),
	                right:parseInt(element.css('padding-right'), 10)
	            }
	        };
	    }
	
	    function calculateOuterDistance(elementDimensions) {
	        var top = elementDimensions.border.top;
	        top += elementDimensions.margin.top;
	        top += elementDimensions.padding.top;
	
	        var bottom = elementDimensions.border.bottom;
	        bottom += elementDimensions.margin.bottom;
	        bottom += elementDimensions.padding.bottom;
	
	        var left = elementDimensions.border.left;
	        left += elementDimensions.margin.left;
	        left += elementDimensions.padding.left;
	
	        var right = elementDimensions.border.right;
	        right += elementDimensions.margin.right;
	        right += elementDimensions.padding.right;
	
	        return {
	            vertical : top + bottom,
	            horizontal : left + right,
	            top: top,
	            bottom: bottom,
	            left: left,
	            right: right,
	            paddingLeft: elementDimensions.padding.left,
	            paddingTop: elementDimensions.padding.top
	        };
	    }
	
	    function getOuterDistances() {
	        var containerDimensions = getElementDimensions(view);
	        var containerDistances = calculateOuterDistance(containerDimensions);
	
	        var puzzle = $(document.createElement("div"));
	        puzzle.addClass('puzzle');
	        view.append(puzzle);
	        var puzzleDimensions = getElementDimensions(puzzle);
	        var puzzleDistances = calculateOuterDistance(puzzleDimensions);
	        $(puzzle).remove();
	
	        return {
	            container: containerDistances,
	            puzzle: puzzleDistances
	        };
	    }
	
	    function getMarkDimensions() {
	        var tempMark = $(document.createElement('div'));
	        $(tempMark).addClass('mark').addClass('correct');
	        view.append(tempMark);
	
	        var markWidth = $(tempMark).width();
	        var markHeight = $(tempMark).height();
	
	        $(tempMark).remove();
	
	        return {
	            width: markWidth,
	            height: markHeight
	        };
	    }
	
	    function addBorderClasses() {
	        for (var h = 0; h < model.columns; h++) {
	            $(board[0][h]).addClass('top');
	            $(board[model.rows - 1][h]).addClass('bottom');
	        }
	
	        for (var v = 0; v < model.rows; v++) {
	            $(board[v][0]).addClass('left');
	            $(board[v][model.columns - 1]).addClass('right');
	        }
	    }
	
	    function initPuzzle(width, height, rows, columns, imageNode) {
	        var outerDistances = getOuterDistances();
	        var markDimensions = getMarkDimensions();
	        var containerWidth = width - outerDistances.container.horizontal;
	        var containerHeight = height - outerDistances.container.vertical;
	
	        puzzleWidth =  parseInt(containerWidth / columns - outerDistances.puzzle.horizontal, 10);
	        puzzleOuterWidth = puzzleWidth + outerDistances.puzzle.horizontal;
	        puzzleHeight = parseInt(containerHeight / rows - outerDistances.puzzle.vertical, 10);
	        puzzleOuterHeight = puzzleHeight + outerDistances.puzzle.vertical;
	
	        topOffset = outerDistances.container.paddingTop;
	        leftOffset = outerDistances.container.paddingLeft;
	
	        var markHorizontalOffset = (puzzleOuterWidth - markDimensions.width) / 2;
	        var markVerticalOffset = (puzzleOuterHeight - markDimensions.height) / 2;
	
	        for (var row = 0; row < rows; row++) {
	            board[row] = [];
	            indexBoard[row] = [];
	
	            for (var col = 0; col < columns; col++) {
	                mark = $(document.createElement('div'));
	                mark.addClass('mark');
	                mark.css({
	                    top: ((puzzleHeight * row + markVerticalOffset) + "px"),
	                    left: ((puzzleWidth * col + markHorizontalOffset) + "px")
	                });
	                mark.attr("position", row + "-" + col);
	                indexBoard[row][col] = mark;
	                view.append(mark);
	
	                puzzle = $(document.createElement("div"));
	                puzzle.addClass('puzzle');
	                puzzle.css({
	                    backgroundImage: "url( '" + imageNode.attr("src") + "' )",
	                    backgroundSize: width + "px " + height + "px" ,
	                    backgroundRepeat: "no-repeat",
	                    backgroundPosition: (
	                        (col * -puzzleWidth) + "px " +
	                            (row * -puzzleHeight) + "px"
	                        ),
	                    top: ((puzzleOuterHeight * row + topOffset) + "px"),
	                    left: ((puzzleOuterWidth * col + leftOffset) + "px"),
	                    width: puzzleWidth + 'px',
	                    height: puzzleHeight + 'px'
	                });
	
	                puzzle.attr("href", "javascript:void( 0 );").click(clickHandler);
	                puzzle.attr("position", row + "-" + col);
	                board[row][col] = puzzle;
	                view.append(puzzle);
	            }
	        }
	
	        view.css({
	            width: (puzzleOuterWidth * columns) + 'px',
	            height: (puzzleOuterHeight * rows) + 'px'
	        });
	
	        addBorderClasses();
	        shuffle();
	    }
	
	    /**
	     * Fisher-Yates Shuffle algorithm: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
	     * Original algorithm is based on flatt, one-dimension array. For our purposes (working on two-dimension arrays)
	     * firstly we have to flatten the structure.
	     *
	     * Additionally Knuth allows items to be shuffled multiple times - in our case each puzzle (array element) has to be
	     * shuffled once, but the whole procedure should be repeated at least twice.
	     */
	
	    function getShuffleSequence(array) {
	        var flatArray = [],
	            shuffleSequence = [],
	            row, column, counter, index;
	
	        for (row = 0; row < array.length; row++) {
	            for (column = 0; column < array[row].length; column++) {
	                flatArray.push({ row: row, column: column });
	            }
	        }
	
	        counter = flatArray.length - 1;
	
	        // While there are at least two elements in the array we generate next shuffle sequence. If array has only one
	        // element we end the sequence (there is no sense in shuffling puzzle in place).
	        while (counter >= 2) {
	            index = (Math.random() * counter) | 0;
	
	            shuffleSequence.push({
	                row: { from: flatArray[counter].row, to: flatArray[index].row },
	                column: { from: flatArray[counter].column, to: flatArray[index].column }
	            });
	
	            flatArray.splice(index, 1);
	            flatArray.splice(-1, 1);
	
	            counter -= 2;
	        }
	
	        return shuffleSequence;
	    };
	
	    function shuffle() {
	        var i, iteration,
	            shuffleSequence, shuffle,
	            $firstPiece, $secondPiece;
	
	        animation = false; // Shuffling should be without animation
	
	        for (iteration = 0; iteration < 3; iteration++) {
	            shuffleSequence = getShuffleSequence(board);
	
	            for (i = 0; i < shuffleSequence.length; i++) {
	                shuffle = shuffleSequence[i];
	
	                $firstPiece = board[shuffle.row.from][shuffle.column.from];
	                $firstPiece.trigger({
	                    type: "click",
	                    triggered: true
	                });
	
	                $secondPiece = board[shuffle.row.to][shuffle.column.to];
	                $secondPiece.trigger({
	                    type: "click",
	                    triggered: true
	                });
	            }
	        }
	
	        animation = true;
	    }
	
	    function elementHasClasses(element) {
	        element = $(element);
	
	        return {
	            top: element.hasClass('top'),
	            bottom: element.hasClass('bottom'),
	            left: element.hasClass('left'),
	            right: element.hasClass('right')
	        };
	    }
	
	    function removeBorderClasses(element) {
	        $(element).removeClass('top').removeClass('bottom').removeClass('left').removeClass('right');
	    }
	
	    function applyBorderClasses(element, classes) {
	        for (var className in classes) {
	            if (classes[className]) {
	                $(element).addClass(className);
	            }
	        }
	    }
	
	    function replaceBorderClasses(firstElement, secondElement) {
	        var firstElementClasses = elementHasClasses(firstElement)
	        var secondElementClasses = elementHasClasses(secondElement)
	
	        removeBorderClasses(firstElement);
	        removeBorderClasses(secondElement);
	
	        applyBorderClasses(firstElement, secondElementClasses);
	        applyBorderClasses(secondElement, firstElementClasses);
	    }
	
	    function isSamePiece(piece1, piece2) {
	        var piece1ID = $(piece1).attr('position'),
	            piece2ID = $(piece2).attr('position');
	
	        return piece1ID == piece2ID;
	    }
	
	    function clickHandler(event) {
	
	        var Piece = $(this);
	        // Check to see if we are in the middle of an animation.
	        if (clickNumber == 0) {
	            clickNumber = 1;
	            PieceOld = $(this);
	            PieceOld.addClass('selected');
	            PiecePos = {
	                top: parseInt(Piece.css("top")),
	                left: parseInt(Piece.css("left"))
	            };
	            PiecePos.row = Math.floor(((PiecePos.top - topOffset) / puzzleOuterHeight) + 0.5);
	            PiecePos.col = Math.floor(((PiecePos.left - leftOffset) / puzzleOuterWidth) + 0.5);
	        } else {
	            clickNumber = 0;
	            PiecePos2 = {
	                top: parseInt(Piece.css("top")),
	                left: parseInt(Piece.css("left"))
	            };
	            PiecePos2.row = Math.floor(((PiecePos2.top - topOffset) / puzzleOuterHeight) + 0.5);
	            PiecePos2.col = Math.floor(((PiecePos2.left - leftOffset) / puzzleOuterWidth) + 0.5);
	            PieceOld.removeClass('selected');
	
	            if (isSamePiece(PieceOld, Piece)) return;
	
	            board[PiecePos2.row][PiecePos2.col] = PieceOld;
	            board[PiecePos.row][PiecePos.col] = Piece;
	
	            if (animation) {
	                //Animate change of places
	                board[PiecePos.row][PiecePos.col].animate({
	                    left: ((puzzleOuterWidth * PiecePos.col + leftOffset) + "px"),
	                    top: ((puzzleOuterHeight * PiecePos.row + topOffset) + "px")
	                }, 200);
	
	                board[PiecePos2.row][PiecePos2.col].animate({
	                    left: ((puzzleOuterWidth * PiecePos2.col + leftOffset) + "px"),
	                    top: ((puzzleOuterHeight * PiecePos2.row + topOffset) + "px")
	                }, 200);
	            } else {
	                board[PiecePos.row][PiecePos.col].css({
	                    left: ((puzzleOuterWidth * PiecePos.col + leftOffset) + "px"),
	                    top: ((puzzleOuterHeight * PiecePos.row + topOffset) + "px")
	                });
	                board[PiecePos2.row][PiecePos2.col].css({
	                    left: ((puzzleOuterWidth * PiecePos2.col + leftOffset) + "px"),
	                    top: ((puzzleOuterHeight * PiecePos2.row + topOffset) + "px")
	                });
	            }
	
	            replaceBorderClasses(board[PiecePos.row][PiecePos.col], board[PiecePos2.row][PiecePos2.col]);
	        }
	    }
	
	    function clearPieceCssStyle() {
	        for (var rowIndex = 0; rowIndex < model.rows; rowIndex++) {
	            for (var colIndex = 0; colIndex < model.columns; colIndex++) {
	                indexBoard[rowIndex][colIndex].removeClass('wrong').removeClass('correct');
	            }
	        }
	    }
	
	    function run() {
	
	        var imageNode = view.find( "img:first" );
	        imageNode.attr('src', model.Image);
	        imageNode.attr('height', model.height);
	        imageNode.attr('width', model.width);
	
	        if (imageNode.complete) { // The image has loaded so call Init.
	        	initPuzzle(model.width, model.height);
	        } else { // The image has not loaded so set an onload event handler to call Init.
	        	imageNode.load(function() {
	                initPuzzle(model.width, model.height, model.rows, model.cols, imageNode);
	            });
	        }
	
	    };
	    
	    
	    run();
	}

	
}