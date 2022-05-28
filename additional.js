$(()=> {
	let inputSearch = $("#search-input"),
		searchHelp = $("#search-help"),
		searchHelpFlag = 0;

	function timeoutByFlag(flag_counter, time, callback) {
		if (searchHelpFlag != flag_counter) return;

		if (time <= 0)
			callback();

		time -= 50;
		setTimeout(() => {timeoutByFlag(flag_counter, time, callback)}, 50);
	}

	function searchShowHide() {
		searchHelpFlag++;
		searchHelp.show(200);
		timeoutByFlag(searchHelpFlag, 5000, () => {searchHelp.hide(1000);});
	}

	inputSearch.focus(() => { searchShowHide(); })
	searchHelp.on("click", () => { searchHelp.hide(200)});
});
