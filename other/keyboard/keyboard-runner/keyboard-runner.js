window.onload = () => {
	let positions = document.querySelectorAll("#positions li"),
		positions_el = [],
		keys	  = document.querySelectorAll("#keys li"),
		keys_el	  = [],
		badGuy	  = document.getElementById("bad-guy"),
		level_el  = document.getElementById("level-text"),
		youLose_el = document.getElementById("you-lose"),
		speed_input = document.getElementById("settings-speed"),
		speed_freeze = document.getElementById("settings-speed-freeze"),
		settings_sound = document.getElementById("settings-sound"),
		background = document.getElementById("background");

	let KEYS = [],
		LEN = 13,
		STATUS = 0,
		NEXT = 0,
		badGuy_position = -750,
		LEVEL = 0,
		SPEED = 5,
		SPEED_FREEZE = false,
		COUNT_COOL = 0,
		WRONG_FLAG = false,
		PLAY_SOUND = true;

	speed_freeze.onchange = (e) => { SPEED_FREEZE = e.target.checked; }
	speed_input.oninput = (e) => {
		let value = Number(e.target.value);
		if (isNaN(value)) return;
		SPEED = value;
	}
	settings_sound.onchange = (e) => { PLAY_SOUND = !e.target.checked; }

	function play(src) {
		if (PLAY_SOUND) {
			let audio = new Audio(src);
			audio.play();
		}
	}

	function prepare() {
		KEYS = [];
		if (!SPEED_FREEZE) {
			SPEED += 1;
			speed_input.value = SPEED;
		}
		NEXT = 0;
		badGuy_position = -750;
		LEVEL += 1;
		WRONG_FLAG = false;

		level_el.innerText = LEVEL;
		badGuy.style.marginLeft = "-750px";
		badGuy.style.display = "none";
		youLose_el.style.display = "none";
		// background.style.background = "url()";
		background.style.display = "none";

		if (COUNT_COOL > 0) play(`./sound/${COUNT_COOL}.mp3`);

		let min = 97,
			max = 122;

		for (let el of keys) {
			let charCode = Math.floor(Math.random()*(max-min)+min);
			KEYS.push(charCode);
			el.style.background = '';
			if (keys_el.length < LEN)
				keys_el.push(el);
			el.innerText = String.fromCharCode(charCode).toLowerCase();
		} 

		// for (let el of positions) {
		// 	el.innerHTML = '';
		// 	if (positions_el.length < LEN)
		// 		positions_el.push(el);
		// }
		if (positions_el.length == 0) for (let el of positions) positions_el.push(el);

		let img = document.createElement("img");
		img.setAttribute("src", "images/hero.gif");
		img.classList.add("hero");
		positions_el[0].appendChild(img);
	}

	function intersection() {
		let bcoords = badGuy.getBoundingClientRect(),
			hcoords;
		try {
			hcoords = document.querySelector(".hero").getBoundingClientRect();
		} catch (err) {
			return false;
		}

		let dnask = bcoords.x+bcoords.width-50;

		return hcoords.x <= dnask && dnask <= hcoords.x+hcoords.width ? true : false;
	}

	function move() {
		if (STATUS == 0) return;
		if (badGuy_position < -555)
			badGuy.style.display = "none";
		else
			badGuy.style.display = "block";
		badGuy_position += SPEED;
		badGuy.style.marginLeft = `${badGuy_position}px`;
		if (intersection()) {
			STATUS = 2;
			COUNT_COOL = 0;
			let hero = document.querySelector(".hero");
			hero.setAttribute("src", "images/the-end.gif");
			hero.style.marginTop = "-25px";
			level_el.innerText = "YOU LOSE";
			youLose_el.style.display = "block";
			if (PLAY_SOUND) {
				play("./sound/dead.mp3");
				// background.style.background = "url(images/dead.gif) cover ";
				background.style.display = "block";
			}
			setTimeout(() => {
				hero.remove();
			}, 1000);

			setTimeout(() => {
				// background.style.background = "url()";
				background.style.display = "none";
			}, 6000);
		}
		else
			setTimeout(move, 10);
	}

	function blink(a, time) {
		let timer_p = time/a;
		blink_delay(timer_p, a);
	}
	function blink_delay(timer_p, a) {
		badGuy_position  += 1;
		a -= 1;
		if (a > 0)
			setTimeout(() => { blink_delay(timer_p, a); }, timer_p);
	}

	function next(charCode) {
		if (charCode == KEYS[NEXT]) {
			keys_el[NEXT].style.background = "rgb(43 255 89 / 50%)";
			positions_el[NEXT].innerHTML = '';
			if (NEXT+1 == positions_el.length) {
				STATUS = 0;
				if (!WRONG_FLAG) COUNT_COOL = COUNT_COOL == 8 ? 8 : COUNT_COOL + 1;
				return true;
			}
			NEXT++;
			let img = document.createElement("img");
			img.setAttribute("src", "images/hero.gif");
			img.classList.add("hero");
			positions_el[NEXT].appendChild(img);
		} else {
			play("./sound/wrong.mp3");
			WRONG_FLAG = true;
			COUNT_COOL = 0;
			blink(50, 250);
			keys_el[NEXT].style.background = "rgb(239 38 38 / 50%)";
		}

		return false;
	}

	prepare();
	document.addEventListener("keypress", (e) => {
		if (STATUS == 2 && e.charCode == 32) {
			LEVEL = 0;
			if (!SPEED_FREEZE) SPEED = 0;
			STATUS = 0;
			prepare();
			return;
		}
		if (STATUS == 0 && e.charCode == KEYS[0]) {
			STATUS = 1;
			move();
		}
		if (STATUS == 1)
			if (next(e.charCode)) prepare();
	});
};