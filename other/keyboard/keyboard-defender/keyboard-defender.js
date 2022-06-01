window.onload = () => {
	let SPEED_WORDS = 1,
		SPEED_GENERATION = 5000,
		COUNTER = 0,
		SCORE = 0,
		LANGUAGE = 'en',
		WORDS = {
			"ru": RU,
			"en": EN
		},
		WIDTH = 1000,
		H_WIDTH = WIDTH/2;
		STATUS = true,
		HEALTH = 1,
		HEARTS = document.querySelectorAll("#hearts-ul li"),
		CURRENT_HEART = 4,
		SIDE = true,
		INTERSECTION_LINE = bottom.getBoundingClientRect().top;

	let status = document.getElementById("status"),
		top	   = document.getElementById("top"),
		totalScore = document.getElementById("total-score"),
		language = document.getElementById("language");

	function minus_heart() {
		HEALTH -= 1;

		HEARTS[CURRENT_HEART].style.background = 'none';
		CURRENT_HEART--;

		if (HEALTH == 0) {
			STATUS = false;
			for (let el of document.querySelectorAll(".object")) {
				el.setAttribute("move", "false");
				el.remove();
			}
			status.style.display = "flex";
			totalScore.innerText = SCORE;
			reset.innerText = "Заново?";
		}
	}

	function intersection(el) {
		let coords = el.getBoundingClientRect();

		return coords.y + coords.height >= INTERSECTION_LINE ? true : false;
	}

	function move(el) {
		if (el.getAttribute("move") != "true") return;
		let top = Number(el.style.top.replace('px', ''));
		top += 0.5;
		el.style.top = `${top}px`;
		if (intersection(el)) {
			minus_heart();
			el.remove();
		}
		else
			setTimeout(() => { move(el) }, SPEED_WORDS/2);
	}

	function generator() {
		let word   = WORDS[LANGUAGE][Math.floor(Math.random()*WORDS[LANGUAGE].length)],
			object = document.createElement("div");
		object.classList.add("object");
		object.innerText = word;
		object.setAttribute("move", "true");
		container.appendChild(object);

		object.style.top  = '0px';
		object.style.left = `${Math.random()*(WIDTH-object.getBoundingClientRect().width-H_WIDTH)+(SIDE ? 0 : H_WIDTH)}px`;
		SIDE = !SIDE;

		move(object);
	}

	function play() {
		if (!STATUS) return;

		if (COUNTER >= 5) {
			COUNTER = 0;
			SPEED_GENERATION *= 0.85;
			SPEED_WORDS *= 0.85;
		}
		generator();
		setTimeout(play, SPEED_GENERATION);
	}

	function restart() {
		top.innerText = '';
		status.style.display = "none";
		reset.innerText = "";
		for (let el of HEARTS) {
			el.style.background = "url(images/heart.png) center";
			el.style.backgroundSize = 'contain';
		}
		COUNTER = 0;
		SCORE = 0;
		HEALTH = 5;
		CURRENT_HEART = 4;
		SPEED_WORDS = 100;
		SPEED_GENERATION = 5000;
		STATUS = true;

		play();
	}

	weapon.onchange = (e) => {
		let objects = document.querySelectorAll(".object"),
			value   = e.target.value;

		for (let el of objects) {
			if (value == el.innerText) {
				el.setAttribute("move", "false");
				el.remove();
				e.target.value = '';
				COUNTER += 1;
				SCORE += 1;
				top.innerText = SCORE;
				if (document.querySelectorAll(".object").length == 0)
					generator();
				break;
			}
		}
	}

	reset.onclick = (e) => restart();

	language.onclick = (e) => {
		if (e.target.innerText == "ru") {
			LANGUAGE = "en";
			e.target.innerText = "en";
		} else {
			LANGUAGE = "ru";
			e.target.innerText = "ru";
		}
	}

	weapon.focus();
	restart();
}