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
		var topFive = [];
		var lastFive = [];
		var totalScore = 0;
		var totalGames = 0;

		function saveCookies(score) {
			// expired date for cookie 
			var expireDate = new Date();
			// set for one year
			expireDate.setTime(expireDate.getTime() + (31536000000));

			if (score) {
				// get top five
				topFive.push(score);
				topFive.sort(function (a, b) {
					return parseFloat(b) - parseFloat(a);
				});
				topFive = topFive.slice(0, 5);

				// update top five
				lastFive.unshift(score);
				lastFive = lastFive.slice(0, 5);

				totalScore = totalScore + score;
				totalGames = totalGames + 1;
			}

			document.cookie = "topFive=" + encodeURIComponent(topFive.join()) + ";expire=" + expireDate.toUTCString() + ";";
			document.cookie = "lastFive=" + encodeURIComponent(lastFive.join()) + ";expire=" + expireDate.toUTCString() + ";";
			document.cookie = "totalScore=" + encodeURIComponent(totalScore) + ";expire=" + expireDate.toUTCString() + ";";
			document.cookie = "totalGames=" + encodeURIComponent(totalGames) + ";expire=" + expireDate.toUTCString() + ";";
		}

		function getCookies() {
			var cookies = document.cookie.split(";");
			cookies.forEach(function (cookie) {
				var keyvalue = cookie.split("=");
				if (keyvalue.length > 1) {
					var key = keyvalue[0].trim();
					var value = keyvalue[1].trim();
					switch (key) {
						case "topFive":
							topFive = decodeURIComponent(value).split(",");
							break;
						case "lastFive":
							lastFive = decodeURIComponent(value).split(",");
							break;
						case "totalScore":
							totalScore = parseFloat(decodeURIComponent(value));
							break;
						case "totalGames":
							totalGames = parseInt(decodeURIComponent(value));
							break;
						default:
							break;
					}
				}
			});
		}

		function buildGame() {
			// reset boxes
			var boxes = [0.01, 1, 5, 10, 25, 50, 75, 100, 200, 300, 400, 500,
				750, 1000, 5000, 10000, 25000, 50000, 75000, 100000, 200000,
				300000, 400000, 500000, 750000, 1000000];
			var boxesLeft = [];

			// build scoreboad
			$(".scoreboard").html("<div class='scoreboard-left'></div><div class='scoreboard-right'></div>");
			boxes.forEach(function (value, index) {
				if (index > 12) {
					$(".scoreboard-right").append("<div class='scoreboard-value' data-value='" + value + "'>$" + value.toLocaleString("en") + "</div>");
				} else {
					$(".scoreboard-left").append("<div class='scoreboard-value' data-value='" + value + "'>$" + value.toLocaleString("en") + "</div>");
				}
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
			var topValue = 0;
			var offer = 0;
			boxesLeft.forEach(function (value) {
				average = average + value;
				if (value === 0) {
					boxesGone = boxesGone + 1;
				}
				if (value > topValue) {
					topValue = value;
				}
			});
			average = average / (boxesLeft.length - boxesGone);
			offer = average * round / 7 < topValue ? average * round / 7 : average;
			currentOffer = Math.floor(offer);
			dialogElem.html("Deal or no deal?");
			$(".current-offer-value").text("$" + currentOffer.toLocaleString("en"));

			// remove disable class
			$(".offer-button").removeClass("disabled");
			$(".box-item").addClass("disabled");

			// offer buttons
			$("button.deal").on("click", function () {
				$(".offer-button").off("click");
				$(".offer-button").addClass("disabled");
				dialogElem.html("Game over! You won $" + currentOffer.toLocaleString("en") + " Your case had $" + boxesLeft[chosenBox].toLocaleString("en") + "<br><button class='start-game'>Play again</button>");
				$(".start-game").on("click", playGame);
				saveCookies(currentOffer);
			});
			$("button.no-deal").on("click", function () {
				$(".offer-button").off("click");
				$(".offer-button").addClass("disabled");
				$(".current-offer-value").text("---");
				$(".previous-offers").prepend("<div>$" + currentOffer.toLocaleString("en") + "</div>");
				round = round + 1;
				if (round > 9) {
					dialogElem.html("Game over! You won: $" + boxesLeft[chosenBox].toLocaleString("en") + "<br><button class='start-game'>Play again</button>");
					$(".start-game").on("click", playGame);
					saveCookies(boxesLeft[chosenBox]);
				} else {
					$(".box-item").removeClass("disabled");
					playRound();
				}
			});
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
				round = 1;
				playRound();
			});
		}

		function playGame() {
			// remove start button
			$(".start-game").remove();

			// build game
			boxesLeft = buildGame();

			// clear text
			$(".previous-offers").html("");
			$(".current-offer-value").text("---");
			$(".round").text("");

			// get chosen box
			getBox();
		}

		function closeModal() {
			$("body").removeClass("open-modal");
			$(".modal").remove();
			$("body").off("click");
		}

		function resetStats() {
			// clear variables
			topFive = [];
			lastFive = [];
			totalScore = 0;
			totalGames = 0;

			// save variables
			saveCookies(false);

			// change stats texts
			$(".top-five ol").html("");
			$(".last-five ol").html("");
			$(".average-value").html("---");
		}

		function buildModal() {
			// add initial modal
			$("body").addClass("open-modal");
			var modal = "<div class='modal'><div class='top-five'>Top Five Games<ol></ol></div><div class='last-five'>Last Five Games<ol></ol></div><div class='average'>Average: <span class='average-value'></span></div><button class='close-modal'>Close</button><button class='reset-stats'>Reset</button></div>";
			$("body").append(modal);

			// add top five
			topFive.forEach(function (value) {
				if (value) {
					$(".top-five ol").append("<li>$" + parseFloat(value).toLocaleString("en") + "</li>");
				}
			});

			// add top five
			lastFive.forEach(function (value) {
				if (value) {
					$(".last-five ol").append("<li>$" + parseFloat(value).toLocaleString("en") + "</li>");
				}
			});

			// add average
			var average;
			if (totalGames > 0) {
				average = Math.floor(parseFloat(totalScore) / parseFloat(totalGames) * 100) / 100;
			} else {
				average = "---";
			}
			$(".average-value").text("$" + average.toLocaleString("en"));

			// add close functionality
			$(".close-modal, body").on("click", closeModal);
			$(".modal").on("click", function (e) {
				e.stopPropagation();
			});

			// add reset functionality
			$(".reset-stats").on("click", resetStats);
		}

		// get cookies
		getCookies();

		// start game on click
		$(".start-game").on("click", playGame);

		// stats button
		$(".view-stats").on("click", function (e) {
			e.stopPropagation();
			buildModal();
		});
	});
}(jQuery));