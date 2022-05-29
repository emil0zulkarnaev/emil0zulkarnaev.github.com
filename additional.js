function addCodeLineNumbers(el, count) {
	let coords = el.getBoundingClientRect();
	let x = coords.x,
		y = coords.y,
		ul = document.createElement("ul");
	let pre = document.createElement("pre"),
		text = '';

	for (let i=0; i<count; i++) {
		let li = document.createElement("li");
		li.innerText = String(i+1);
		ul.appendChild(li);
		text += String(i+1) + '\n';
	}

	pre.classList.add("code-line-numbers");
	pre.style.position = "absolute";

	ul.classList.add("code-line-numbers");
	ul.style.position = "absolute";

	ul.style.top  = `${y+10}px`;
	ul.style.left = `${x}px`;

	pre.style.top  = `${y}px`;
	pre.style.left = `${x-25}px`;

	pre.innerText = text;

	return pre;
}

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