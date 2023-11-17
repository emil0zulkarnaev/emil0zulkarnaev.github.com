var TODO_ADD_INPUT, TODO_ADD_BUTTON_CLOSE, TODO_ADD_BUTTON, TODO_SEARCH_BUTTON, TODO_DATE, TODO_IMPORTANCE, TOP, LIST, STORAGE;

window.addEventListener("load", () => {
	TODO_ADD_INPUT = document.querySelector("#todo_input"),
	TODO_ADD_BUTTON_CLOSE = document.querySelector("#todo-add-button-close"),
	TODO_ADD_BUTTON = document.querySelector("#todo-add-button"),
	TODO_SEARCH_BUTTON = document.querySelector("#todo-search-button"),
	TODO_DATE = document.querySelector("#todo_date"),
	TODO_IMPORTANCE = document.querySelector("#todo_importance"),
	TOP = document.querySelector(".top"),
	LIST = document.querySelector("#list"),
	STORAGE = {};

	STORAGE = localStorage.getItem("STORAGE");
	if (STORAGE == null) STORAGE = {data: []};
	else STORAGE = JSON.parse(STORAGE);

	TODO_ADD_INPUT.onclick = () => {
		TOP.classList.add("top-add-adding");
		TODO_ADD_BUTTON_CLOSE.style.display = "block";
		TODO_ADD_BUTTON.style.display = "block";
		TODO_SEARCH_BUTTON.style.display = "block";
	}

	TODO_ADD_BUTTON_CLOSE.onclick = () => {
		TODO_ADD_BUTTON_CLOSE.style.display = "none";
		TODO_ADD_BUTTON.style.display = "none";
		TODO_SEARCH_BUTTON.style.display = "none";
		TOP.classList.remove("top-add-adding");
	}

	TODO_ADD_BUTTON.onclick = addToDo;

	update();
});

function create(name, classes, attributes, content="") {
	let result = document.createElement(name);

	for (let el of classes)
		result.classList.add(el);
	for (let attr in attributes)
		result.setAttribute(attr, attributes[attr]);

	if (content.length != 0) {
		result.innerText = content;
	}

	return result;
}

function addCh(parent, elements) {
	for (let el of elements) {
		parent.appendChild(el);
	}
}

function update() {

	LIST.innerHTML = '';

	for (let el of STORAGE.data) {
		let todo_group = create("div", ["todo-group"]),
			todo_group_manage = create("div",["todo-group-manage"]),
			img_edit = create("img", [], {"src": "edit.png"}),
			img_trash = create("img", [], {"src": "trash.png"}),
			todo_top_date = create("div", ["todo-top-date"], {}, el.date),
			todo_header = create("div", ["todo-header"], {}, el.header);

		addCh(todo_group_manage, [img_edit, img_trash]);

		addCh(todo_group, [todo_group_manage, todo_top_date, todo_header]);

		let todo_group_elements = [],
			checkbox_id = 1;

		for (let c of el.content) {
			switch (c.t) {
			case "p":
				todo_group_elements.push(create("div", ["todo-p"], {}, c.content));

				break;

			case "l":
				let todo_list = create("div", ["todo-list"]);
				for (let l of c.elements) {
					let todo_list_element_group = create("div", ["todo-list-element-group"]),
						checkbox = create("input", ["todo-list-element-checkbox"], {"type": "checkbox", "id": `for-label-${checkbox_id}`}),
						label = create("label", ["todo-list-element-checkbox-label"], {"for": `for-label-${checkbox_id}`}, l);

					addCh(todo_list_element_group, [checkbox, label]);
					addCh(todo_list, [todo_list_element_group]);

					checkbox_id ++;
				}

				todo_group_elements.push(todo_list);

				break;

			default:
				break;
			}
		}

		addCh(todo_group, todo_group_elements);

		if (el.hashtags != null) {
			let todo_top_hashtags = create("div", ["todo-top-hashtags"]),
				hashtags = [];

			for (let h of el.hashtags) {
				hashtags.push(create("div", ["todo-top-hashtag"], {}, `#${h}`));
			}

			addCh(todo_top_hashtags, hashtags);
			addCh(todo_group, [todo_top_hashtags]);
		}


		addCh(LIST, [todo_group]);
	}

}

function save(element) {
	STORAGE.data.push(element);

	localStorage.setItem("STORAGE", JSON.stringify(STORAGE));

	update();
}

function parseContent(text) {
	if (text.length == 0) return {}, false;

	let result = {};

	console.log(text);

	let header_search = text.match(/^(.+)\n/g);
	if (header_search == null) return {}, false;

	result.header = header_search[0].trim();

	let elements = text.match(/(\n.+)+/g);
	if (elements == null) return {}, false;

	let l_regexp = /^\n(\-.+\n)+/gm,
		h_regexp = /#.+$/g;

	// console.log("elements", elements);

	result.content = [];

	for (let el of elements) {
		if (l_regexp.test(el)) {
			result.content.push({"t": "l", "elements": el.trim().split("\n").map((item) => item.slice(1,))});
		} else
		if (h_regexp.test(el)) {
			result.hashtags = el.trim().split("#").slice(1,);
		} else {
			result.content.push({"t": "p", "content": el.trim()});
		}
	}

	return [result, true];
}

function addToDo() {
	let okay = true,
		content = {};

	[content, okay] = parseContent(TODO_ADD_INPUT.value);
	console.log(content, okay);
	if (!okay) return;

	content.date = TODO_DATE.value;
	content.importance = TODO_IMPORTANCE.value;

	save(content);
}