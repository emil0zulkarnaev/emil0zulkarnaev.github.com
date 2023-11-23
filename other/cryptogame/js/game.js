var STATUS = false;
var SOCKET;
var VOLUME = 0.1;
var ROUND_WAIT_TIMER,
	ROUND_WAIT_TIMER_TIME = 0,
	ROUND_WAIT_TIMER_REST_OF_TIME = 0;

var ROUND_TIMER,
	ROUND_TIMER_TIME = 0,
	ROUND_TIMER_REST_OF_TIME = 0;

// for debug
var USER_ID = "";

// if(/Android|webOS|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
//   // true for mobile device
//   USER_ID = "2";
// } else {
//   // false for not mobile device
//   USER_ID = "1";
// }

// КОМАНДЫ НА ОТПРАВКУ
const CLIENT_CHECK_STATUS = 1,
	CLIENT_START_GAME = 2
	CLIENT_PICK_WEAPON = 3
	CLIENT_GAME_OVER = 4;

// СИГНАЛЫ С СЕРВЕРА
const CALLBACK_USER_INIT_S = 1,
	  CALLBACK_USER_FIND_S = 2,
	  CALLBACK_S_ROUD_W_ST = 3,
	  CALLBACK_S_WEAPON_W_ST = 4,
	  CALLBACK_S_ROUND_RESULT_ST = 5,
	  CALLBACK_S_GAME_RESULT_ST = 6,
	  CALLBACK_S_GAME_ERROR_ST = 7;

// ТИПЫ ОРУДИЙ
const WEAPON_ROCK = 1,
	  	WEAPON_SCISSORS = 2,
	  	WEAPON_PAPER = 3;

// АЛИАСЫ ИМЁН ОРУДИЙ
const WEAPONS_ALIAS = {
	"stone": WEAPON_ROCK,
	"scissors": WEAPON_SCISSORS,
	"paper": WEAPON_PAPER
};

// ТИПЫ РЕЗУЛЬТАТА ПОЕДИНКА
const ROUND_WIN = 1,
	  ROUND_LOSE = 2,
	  ROUND_DRAW = 3;

// ТИП РЕЗУЛЬТАТОВ ИГРЫ
const GAME_WIN = 1,
	  GAME_LOSE = 2;

const STATE_MACHINE = {
	CALLBACK_USER_INIT_S: false,
	CALLBACK_USER_FIND_S: false,
	CALLBACK_S_ROUD_W_ST: false,
	CALLBACK_S_WEAPON_W_ST: false,
	CALLBACK_S_ROUND_RESULT_ST: false,
	CALLBACK_S_GAME_RESULT_ST: false,
	CALLBACK_S_GAME_ERROR_ST: false,
};

function processing(data) {
	var command = data["command"];

	if (!STATUS) {
		setWindow("error");
		return;
	}

	let rest_of_time, user_score, round;

	switch(command) {
	case CALLBACK_USER_INIT_S:
		if (!STATE_MACHINE[CALLBACK_USER_INIT_S]) {

			// обновление конечного автомата
			for (key in STATE_MACHINE) STATE_MACHINE[key] = false;
			STATE_MACHINE[CALLBACK_USER_INIT_S] = true;

			// volume_picker_radio_buttons = document.querySelectorAll(".volume-picker-radio-init .radio-button");
			
			// volume_picker_radio_buttons.forEach((item) => {
			// 	item.onclick = () => {
			// 		let value = Number(item.innerText);
			// 		if (isNaN(value)) return;

			// 		for (el of volume_picker_radio_buttons) {
			// 			el.classList.remove("radio-button-active");
			// 		}
			// 		item.classList.add("radio-button-active");

			// 		VOLUME = value;
			// 	}
			// });

			document.querySelector(".start-game").onclick = () => {
				if (!SOCKET) {
					setWindow("error");
					return;
				}

				data = {
					"command": CLIENT_START_GAME,
					"user_id": USER_ID,
					"volume": VOLUME
				};
				SOCKET.send(JSON.stringify(data));
			}
		}

		setWindow("main");
		break;

	case CALLBACK_USER_FIND_S:
		setWindow("find");
		break;

	case CALLBACK_S_ROUD_W_ST:
		rest_of_time = Number(data["data"][0]);
		if (isNaN(rest_of_time)) return;

		total_timer_time = Number(data["data"][1]);
		if (isNaN(total_timer_time)) return;

		round = Number(data["data"][2]);
		if (isNaN(round)) return;

		user_score = Number(data["data"][3]);
		if (isNaN(user_score)) return;

		document.querySelector(".next-round-number").innerHTML = `${round+1} РАУНД<br>ПРИГОТОВТЕСЬ`;
		document.querySelector(".current-rounds-score").innerHTML = `Побед: ${user_score}<br>Проигрышей: ${round-user_score}`;

		// Запускается таймер
		ROUND_WAIT_TIMER = document.querySelector(".between-rounds-timer");
		ROUND_WAIT_TIMER_REST_OF_TIME = rest_of_time;
		ROUND_WAIT_TIMER_TIME = total_timer_time;
		roundWaitTimer();

		setWindow("between");

		let moves = document.querySelectorAll(".moves img");

		for (let move of moves) {
			move.classList.remove("move-pick");
		}

		document.querySelector(".moves-title").classList.add("make-a-move");

		break;

	case CALLBACK_S_WEAPON_W_ST:

		rest_of_time = Number(data["data"][0]);
		if (isNaN(rest_of_time)) return;

		total_timer_time = Number(data["data"][1]);
		if (isNaN(total_timer_time)) return;

		round = Number(data["data"][2]);
		if (isNaN(round)) return;

		user_score = Number(data["data"][3]);
		if (isNaN(user_score)) return;

		document.querySelector(".row-timer-timer").innerHTML = `${round+1} РАУНД`;
		document.querySelector(".round-rounds-scored-win-value").innerText = user_score;
		document.querySelector(".round-rounds-scored-lose-value").innerText = round-user_score;


		if (!STATE_MACHINE[CALLBACK_S_WEAPON_W_ST]) {

			// обновление конечного автомата
			for (key in STATE_MACHINE) STATE_MACHINE[key] = false;
			STATE_MACHINE[CALLBACK_S_WEAPON_W_ST] = true;

			let moves = document.querySelectorAll(".moves img");

			moves.forEach((item) => {
				item.onclick = () => {
					if (!STATUS) {
						setWindow("error");
						return;
					}

					let weapon_ind = WEAPONS_ALIAS[item.getAttribute("weapon")];
					if (weapon_ind == undefined) return;

					for (let move of moves) {
						move.classList.remove("move-pick");
					}
					item.classList.add("move-pick");

					document.querySelector(".moves-title").classList.remove("make-a-move");

					data = {
						"command": CLIENT_PICK_WEAPON,
						"user_id": USER_ID,
						"weapon": weapon_ind
					};

					SOCKET.send(JSON.stringify(data));
				}
			});
		}

		// Запускается таймер
		ROUND_TIMER = document.querySelector(".current-round-number .row-timer-view");
		ROUND_TIMER_REST_OF_TIME = rest_of_time;
		ROUND_TIMER_TIME = total_timer_time;
		roundTimer();

		setWindow("round");

		break;

	case CALLBACK_S_ROUND_RESULT_ST:
		if (!STATE_MACHINE[CALLBACK_S_ROUND_RESULT_ST]) {

			// обновление конечного автомата
			for (key in STATE_MACHINE) STATE_MACHINE[key] = false;
			STATE_MACHINE[CALLBACK_S_ROUND_RESULT_ST] = true;

			let status = data["data"][0],
				weapon = data["data"][1],
				op_weapon = data["data"][2];

			let result_el = document.querySelector(".round-result");

			switch (status) {
			case ROUND_WIN:
				result_el.classList.remove("round-result-lose");
				result_el.classList.remove("round-result-none");
				result_el.classList.add("round-result-win");
				result_el.innerText = "ПОБЕДА!";
				break;

			case ROUND_LOSE:
				result_el.classList.add("round-result-lose");
				result_el.classList.remove("round-result-none");
				result_el.classList.remove("round-result-win");
				result_el.innerText = "проигрыш";
				break;

			case ROUND_DRAW:
				result_el.classList.remove("round-result-lose");
				result_el.classList.add("round-result-none");
				result_el.classList.remove("round-result-win");
				result_el.innerText = "нИчЬя";
				break;

			default:
				setWindow("error");
				return;
			}

			if (weapon == op_weapon) {
				document.querySelector(".round-result-animation-paper-on-stone").style.display = "none";
				document.querySelector(".round-result-animation-scissors-cut-paper").style.display = "none";
			 	document.querySelector(".round-result-animation-stone-breaks-scissors").style.display = "none";
			 	document.querySelector(".round-result-animation-draw").style.display = "block";
			}
			else
			if ((weapon == WEAPON_ROCK || weapon == WEAPON_SCISSORS) &&
							 (op_weapon == WEAPON_ROCK || op_weapon == WEAPON_SCISSORS)) {
				document.querySelector(".round-result-animation-draw").style.display = "none";
			 	document.querySelector(".round-result-animation-paper-on-stone").style.display = "none";
				document.querySelector(".round-result-animation-scissors-cut-paper").style.display = "none";
			 	document.querySelector(".round-result-animation-stone-breaks-scissors").style.display = "block";
			}
			else
			if ((weapon == WEAPON_ROCK || weapon == WEAPON_PAPER) && 
							 (op_weapon == WEAPON_ROCK || op_weapon == WEAPON_PAPER)) {
				document.querySelector(".round-result-animation-draw").style.display = "none";
			 	document.querySelector(".round-result-animation-stone-breaks-scissors").style.display = "none";
				document.querySelector(".round-result-animation-scissors-cut-paper").style.display = "none";
			 	document.querySelector(".round-result-animation-paper-on-stone").style.display = "block";
			}
			else
			if ((weapon == WEAPON_PAPER || weapon == WEAPON_SCISSORS) && 
							 (op_weapon == WEAPON_PAPER || op_weapon == WEAPON_SCISSORS)) {
				document.querySelector(".round-result-animation-draw").style.display = "none";
			 	document.querySelector(".round-result-animation-stone-breaks-scissors").style.display = "none";
				document.querySelector(".round-result-animation-paper-on-stone").style.display = "none";
			 	document.querySelector(".round-result-animation-scissors-cut-paper").style.display = "block";
			}

		}

		setWindow("round-result");

		break;

	case CALLBACK_S_GAME_RESULT_ST:

		if (!STATE_MACHINE[CALLBACK_S_ROUND_RESULT_ST]) {

			// обновление конечного автомата
			for (key in STATE_MACHINE) STATE_MACHINE[key] = false;
			STATE_MACHINE[CALLBACK_S_ROUND_RESULT_ST] = true;

			let game_result = Number(data["data"][0]),
					rounds = Number(data["data"][1]);

			let profit = 0;

			user_score = Number(data["data"][2]);

			if (isNaN(game_result) || isNaN(rounds) || isNaN(user_score)) {
				setWindow("error");
				return;
			}

			let game_result_el = document.querySelector(".game-result-result"),
					game_result_score_el = document.querySelector(".game-result-score"),
					game_result_additional = document.querySelector(".game-result-additional");

			switch (game_result) {
			case GAME_WIN:
				game_result_el.innerText = "Победа!";
				game_result_score_el.innerText = `${user_score} из ${rounds}`;
				game_result_additional.innerHTML = `Вы обладатель ${profit} ton`;

				break;
			case GAME_LOSE:
				game_result_el.innerText = "Победа!";
				game_result_score_el.innerText = `${user_score} из ${rounds}`;
				game_result_additional.innerHTML = `Не унывайте, учитесь, <br>и всё получится!`;

				break;

			default:
				setWindow("error");
				return;
			}

			// volume_picker_radio_buttons = document.querySelectorAll(".volume-picker-radio-endgame .radio-button");

			// volume_picker_radio_buttons.forEach((item) => {
			// 	item.onclick = () => {
			// 		let value = Number(item.innerText);
			// 		if (isNaN(value)) return;

			// 		for (el of volume_picker_radio_buttons) {
			// 			el.classList.remove("radio-button-active");
			// 		}
			// 		item.classList.add("radio-button-active");

			// 		VOLUME = value;
			// 	}
			// });

			document.querySelector(".next-game").onclick = () => {
					if (!STATUS) {
						setWindow("error");
						return;
					}

					data = {
						"command": CLIENT_START_GAME,
						"user_id": USER_ID,
						"volume": VOLUME
					};
					SOCKET.send(JSON.stringify(data));
				}
		}

		setWindow("game-result");
		break;

	case CALLBACK_S_GAME_ERROR_ST:
		setWindow("game-error");
		break;
	default:
		setWindow("error");
		break;
	}
}

function getStatus() {
	if (STATUS) {
		SOCKET.send(JSON.stringify({
			"command": CLIENT_CHECK_STATUS,
			"user_id": USER_ID
		}));
		setTimeout(() => {
			getStatus();
		}, 500);
	}
}


function newSocket() {
	let socket = new WebSocket("ws://83.220.171.31:8888/ws");

	socket.onopen = function(e) {
		STATUS = true;

		console.log("[open] Соединение установлено");
		console.log("Отправляем данные на сервер");
		getStatus();
	};

	socket.onmessage = function(event) {
		console.log(`[message] Данные получены с сервера: ${event.data}`);
		processing(JSON.parse(event.data));
	};

	socket.onclose = function(event) {
		STATUS = false;
		SOCKET = newSocket();

		if (event.wasClean) {
			console.log(`[close] Соединение закрыто чисто, код=${event.code} причина=${event.reason}`);
		} else {
			// например, сервер убил процесс или сеть недоступна
			// обычно в этом случае event.code 1006
			console.log('[close] Соединение прервано');
		}
	};

	socket.onerror = function(error) {
		console.log(`[error]`);
	};

	return socket;
}

window.addEventListener("load", () => {
	let tg = window.Telegram.WebApp;

	tg.expand();

	USER_ID = String(tg.initDataUnsafe.user.id);
	
	SOCKET = newSocket();
});


// Таймер ожидания нового раунда
function roundWaitTimer() {
	if (ROUND_WAIT_TIMER_REST_OF_TIME <= 0) return;

	ROUND_WAIT_TIMER.querySelector(".row-timer-timer").innerHTML = `${ROUND_WAIT_TIMER_REST_OF_TIME} сек.`;
	ROUND_WAIT_TIMER.querySelector(".row-timer-view").style = `width: ${Math.round((ROUND_WAIT_TIMER_REST_OF_TIME/ROUND_WAIT_TIMER_TIME)*1000)/10}%`;

	// setTimeout(roundWaitTimer, 1000);
}

// Таймер ожидания финала раунда
function roundTimer() {
	if (ROUND_TIMER_REST_OF_TIME <= 0) return;

	ROUND_TIMER.style = `width: ${Math.round((ROUND_TIMER_REST_OF_TIME/ROUND_TIMER_TIME)*1000)/10}%`;

	// setTimeout(roundTimer, 1000);
}