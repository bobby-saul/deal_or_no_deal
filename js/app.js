(function ($) {
	$(document).ready(function () {
		// set up variables
		var boxesElem = $(".boxes");
		var dialogElem = $(".dialog");
		var round = 0;
		var boxesLeft;
		var chosenBox;
		var choose;
		var currentOffer;

		function buildGame() {
			// reset boxes
			var boxes = [0.01, 1, 5, 10, 25, 50, 75, 100, 200, 300, 400, 500,
				750, 1000, 5000, 10000, 25000, 50000, 75000, 100000, 200000,
				300000, 400000, 500000, 750000, 1000000];
			var boxesLeft = [];

			// build scoreboad
			$(".scoreboard").html("");
			boxes.forEach(function (value) {
				$(".scoreboard").append("<div class='scoreboard-value' data-value='" + value + "'>$" + value + "</div>");
			});

			// randomize boxes
			for (var x = 0; x < 26; x++) {
				var randBox = Math.floor(Math.random() * boxes.length);
				boxesLeft.push(boxes[randBox]);
				boxes.splice(randBox, 1);
			}

			// render boxes
			boxesElem.html("");
			boxesLeft.forEach(function (value, index) {
				boxesElem.append("<button class='box-item' data-box='" + index + "'>" + (index + 1) + "</button>");
			});

			// return random array
			return boxesLeft;
		}

		function makeOffer() {
			// get new offer value
			var average = 0;
			var boxesGone = 0;
			boxesLeft.forEach(function(value) {
				average = average + value;
				if (value === 0) {
					boxesGone = boxesGone + 1;
				}
			});
			average = average/(boxesLeft.length - boxesGone);
			currentOffer = Math.floor(average);
			$(".current-offer-value").text("$" + currentOffer);

			// remove disable class
			$(".offers").removeClass("disable");

			// offer buttons
			if (round < 10) {
				$("button.deal").on("click", function() {
					$(".offer-button").off("click");
					alert("Game over! You won $" + currentOffer + " Your case had $" + boxesLeft[chosenBox]);
					playGame();
				});
				$("button.no-deal").on("click", function() {
					$(".offer-button").off("click");
					$(".previous-offers").prepend("<div>$" + currentOffer + "</div>");
					round = round + 1;
					playRound(round);
				});
			} else {
				alert("Game over! You won: $" + boxesLeft[chosenBox]);
				playGame();
			}
		}

		function playRound() {
			// update text
			$(".round").text("Round: " + round);
			choose = (7 - round) > 0 ? 7 - round : 1;
			dialogElem.text("Open " + choose + " cases.");

			$("button.box-item").not(".clicked").on("click", function () {
				// get opened box
				var openBox = $(this).data("box");

				// remove selected value
				$("[data-value='" + boxesLeft[openBox] + "']").addClass("eliminated");
				boxesLeft.splice(openBox, 1, 0);

				// disable button and update choose number
				$(this).addClass("clicked");
				choose = choose - 1;

				if (choose > 0) {
					dialogElem.text("Open " + choose + " cases.");
					$(this).off("click");
				} else {
					$("button.box-item").off("click");
					makeOffer();
				}
			});
		}

		function getBox() {
			// set dialog box
			dialogElem.text("Select your case.");

			// set buttons clicks
			$("button.box-item").on("click", function () {
				// get chosen box
				chosenBox = $(this).data("box");

				// disable button
				$(this).addClass("clicked");
				$("button.box-item").off("click");

				// play round
				round = round + 1;
				playRound();
			});
		}

		function playGame() {
			// remove start button
			$(".start-game").remove();

			// build game
			boxesLeft = buildGame();

			// clear previous offers
			$(".previous-offers").html("");

			// get chosen box
			getBox();
		}

		// start game on click
		$(".start-game").on("click", playGame);
	});
}(jQuery));