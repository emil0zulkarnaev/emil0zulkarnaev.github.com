// window.onload

var WINDOWS = {};
var CURRENT_WINDOW = "main";

function setWindow(name) {
	WINDOWS[CURRENT_WINDOW].classList.remove("current-window");
	WINDOWS[name].classList.add("current-window");

	CURRENT_WINDOW = name;
}

window.addEventListener("load", () => {
	for (el of document.querySelectorAll(".window")) {
		WINDOWS[el.getAttribute("window")] = el;
	}
});