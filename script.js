$(()=> {
	var DATA = {},
		THEMES = {},	// названия тем
		NOTES  = {},	// названия записей
		TAGS   = {},	// названия хэштегов
		CONVERTER = new showdown.Converter(),
		content = $("#content"),
		content_list = $("#list-of-content"),
		note 	= $("#note"),
		finded  = $("#finded"),
		nothing = $("#nothing");

	function error() {
	}

	function list(el, path) {
		let li 	= document.createElement("li"),
			a  	= document.createElement('a'),
			h2 	= document.createElement('h2'),
			div = document.createElement("div"),
			ul  = document.createElement("ul");

		div.classList.add("hashtags");

		let path_str = '';
		if (typeof(path) == "string")
			path_str = path;
		else
			path_str = path.length == 2 ? `/#${path[0]}-${path[1]}` : `/#${path[0]}-${path[1]}-${path[2]}`;

		a.setAttribute("href", path_str);

		h2.innerText = el["name"];
		a.appendChild(h2);
		li.appendChild(a);

		if (el["hashtags"] != undefined) {
			for (let hashtag of el["hashtags"]) {
				//console.log("hashtag", hashtag);
				let li_ = document.createElement("li"),
					a_	= document.createElement('a');

				a_.setAttribute("href", '#tag-' + hashtag);
				a_.innerText = '#' + hashtag;
				li_.appendChild(a_);
				ul.appendChild(li_);
			}

			div.appendChild(ul);
			li.appendChild(div);
		}

		return li;
	}

	function reload() {
		note.html("");
		content_list.html("");

		var re = /\/#(\d*)-?(\d*)?-?(\d*)?/g;
		var	current_note = re.exec(window.location.href);
		// console.log(current_note);
		if (current_note == null || current_note.length < 2 || current_note[1] == "") {
			re = /\/#tag\-([\w\d\-]+)?/g;
			current_note = re.exec(window.location.href);
			// console.log('tag searching', current_note);
			if (current_note == null || current_note[1] == undefined)
				$.ajax({
					url: "notes/HELLO.md",
					dataType: "text",
					success: (data) => {
						html = CONVERTER.makeHtml(data);
						note.html(html);
					}
				});
			// поиск по хэштегам
			else {
				find_by_tag(current_note[1])
			}
		} else {
			current_note = current_note.filter(value => typeof(value) == "string" && value != '');
			switch (current_note.length) {
			// необходимо загрузить список тем
			case 2:
				for (let el in DATA[current_note[1]]["topics"]) {
					let li = list(DATA[current_note[1]]["topics"][el], [current_note[1], el]);
					content_list.append(li);	
				}
				break;
			// необходимо загрузить список записей (notes)
			case 3:
				for (let el in DATA[current_note[1]]["topics"][current_note[2]]["notes"]) {
					let li = list(DATA[current_note[1]]["topics"][current_note[2]]["notes"][el], [current_note[1], current_note[2], el]);
					content_list.append(li);	
				}
				break;
			// необходимо загрузить запись (note) 
			case 4:
				$.ajax({
					url: "notes/"+DATA[current_note[1]]["topics"][current_note[2]]["notes"][current_note[3]]["file_name"],
					dataType: "text",
					success: (data) => {
						html = CONVERTER.makeHtml(data);
						note.html(html);

						let pre_elements = document.querySelectorAll("#note pre");
						for (let el of pre_elements) {
							let count = el.querySelector("code").innerHTML.trim().split(/\n/).length;
							let pre, ul;
							[pre, ul] = addCodeLineNumbers(el, count);

							note.append(pre);
							// note.append(ul);
						}
					}
				});
				break;
			default:
				return error();
			}
		}
	}

	// получаем исходные данные
	$.getJSON("list.json", (json)=> {
		DATA = json;
		// необходимо получить все наименования тем и записей
		for (var section_key in DATA) {
			if (section_key == "main") continue;
			for (var topic_key in DATA[section_key]["topics"]) {
				THEMES[DATA[section_key]["topics"][topic_key]["name"]] = {
					"url": `#${section_key}-${topic_key}`,
					"name": DATA[section_key]["topics"][topic_key]["name"]
				}
				for (var note_key in DATA[section_key]["topics"][topic_key]["notes"]) {
					let el = DATA[section_key]["topics"][topic_key]["notes"][note_key];
					NOTES[el["name"]] = {
						"name": el["name"],
						"hashtags": el["hashtags"],
						"url": `#${section_key}-${topic_key}-${note_key}`
					};

					for (tag of el["hashtags"]) {
						if (TAGS[tag] == undefined)
							TAGS[tag] = [];
						TAGS[tag].push(NOTES[el["name"]]);
					}
				}
			}
		}

		build_finded_list(find(""));
		reload();
	});

	function find_by_tag(tag_name) {
		if (TAGS[tag_name] == undefined)
			build_finded_list_site([]);
		else {
			let result = [];
			for (let note of TAGS[tag_name]) {
				result.push(["note", note["url"], note["name"], note]);
			}
			build_finded_list_site(result);
		}
	}

	function build_finded_list(result) {
		if (result.length == 0) {
			finded.css("display", "none");
			return;
		}

		finded.css("display", "block");
		finded.html("");

		let text 	= '',
			class_ 	= '';

		for (let row of result) {
			class_ = row[0] == "theme" ? "finded-thema" : "finded-note"
			text += `<a href="${row[1]}"><li class="${class_}">${row[2]}</li></a>`;
		}

		finded.html(text);
	}

	function build_finded_list_site(result) {
		note.html("");
		content_list.html("");
		nothing.css("display", "none");

		if (result.length == 0)
			nothing.css("display", "block");
		else
			for (let el of result) {
				let li = list(el[3], el[1]);
				content_list.append(li);	
			}
	}

	// поиск тем и записей
	function find(value) {
		if (value.trim() == "") return [];

		let result = [];

		for (let name in THEMES) {
			if (name.toLowerCase().indexOf(value) != -1) {
				result.push(["theme", THEMES[name]["url"], name, THEMES[name]]);
			}
		}

		for (let name in NOTES) {
			if (name .toLowerCase().indexOf(value) != -1) {
				result.push(["note", NOTES[name]["url"], name, NOTES[name]]);
			}
		}

		return result;
	}
	
	$("#search-input").on("input", (e) => {
		build_finded_list(find(e.target.value.toLowerCase()));
	});

	$("#search-input").on("keydown", (e) => {
		if(e.keyCode == 13) {
			window.location.href = "/#f%20i%20n%20d";
			let value = e.target.value.trim();
			if (value[0] == '#') {
				find_by_tag(value.replace('#', ''));
			} else
				build_finded_list_site(find(e.target.value));
		}
	});
	
	$(window).on('hashchange', (e) => {
		if (window.location.href.indexOf("#f%20i%20n%20d") != -1) return;
		reload();
	});
});
