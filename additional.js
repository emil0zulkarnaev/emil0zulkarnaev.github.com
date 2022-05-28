$(()=> {
	let inputSearch = $("#search-input"),
		searchHelp = $("#search-help"),
		searchHelpFlag = 0,
		searchHelpSayItAgain = true;

	function timeoutByFlag(flag_counter, time, callback) {
		if (searchHelpFlag != flag_counter) return;

		if (time <= 0)
			callback();

		time -= 50;
		setTimeout(() => {timeoutByFlag(flag_counter, time, callback)}, 50);
	}

	function searchShowHide(first) {
		searchHelpFlag++;
		searchHelp.show(200);
		timeoutByFlag(searchHelpFlag, 5000, () => {searchHelp.hide(1000, () => {
				if (first) searchHelpSayAboutHashtagsSearching();
				else searchHelpContentReset();
			});
		});
	}

	function searchHelpContentReset() {
		searchHelpSayItAgain = false;
		searchHelp.text("Нажми Enter, чтобы вывести все совпадения");
	}
	function searchHelpSayAboutHashtagsSearching() {
		searchHelp.text("Добавьте в начале # для поиска по хештегам");
		setTimeout(() => { searchShowHide(false); }, 2000);
	}

	inputSearch.focus(() => { if (searchHelpSayItAgain) searchShowHide(true); })
	searchHelp.on("click", () => { searchHelp.hide(200)});
});
