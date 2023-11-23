HELPER_TEXT = {
	1: "Здесь вы можете пополнить объём ton'ов",
	2: "Тут вы можете узнать правила игры, очень рекомендуем их почитать",
	3: "Настройте то, что хотите настроить, здесь"
};

LAST_HELPER_IND = 3;

HELPER_STATE = false;

function startHelper() {
	HELPER_STATE = true;

	var crypto_window_view_el = document.querySelector(".crypto-window-view"),
		rules_window_view = document.querySelector(".rules-window-view"),
		settings_window_view = document.querySelector(".settings-window-view");

	var helper = document.querySelector(".main-window-bottom-buttons-helper");

	var helperRepeat = () => {
		if (!HELPER_STATE) return;

		helper.classList.add("main-window-bottom-buttons-helper-non-vision");
		crypto_window_view_el.classList.remove("main-window-bottom-buttons-img-for-helper");
		rules_window_view.classList.remove("main-window-bottom-buttons-img-for-helper");
		settings_window_view.classList.remove("main-window-bottom-buttons-img-for-helper");

		let el_to_change_classList;

		let ind = Math.round(Math.random() * 2 + 1);
		while (ind == LAST_HELPER_IND) {
			ind = Math.round(Math.random() * 2 + 1);
		}
		LAST_HELPER_IND = ind;

		switch (ind) {
		case 1:
			el_to_change_classList = crypto_window_view_el;
			break;
		case 2:
			el_to_change_classList = rules_window_view;
			break;
		case 3:
			el_to_change_classList = settings_window_view;
			break;
		default:
			return;
		}

		setTimeout(() => {
			helper.innerText = HELPER_TEXT[ind];

			el_to_change_classList.classList.add("main-window-bottom-buttons-img-for-helper");
			helper.classList.remove("main-window-bottom-buttons-helper-non-vision");

			setTimeout(helperRepeat, 10000);

		}, 2100);
	}

	helperRepeat();
}

window.addEventListener("load", () => {
	startHelper();
});