$(()=> {
	var DATA = {},
		THEMES = [],	// названия
		NOTES  = {},	// названия
		CONVERTER = new showdown.Converter(),
		content = $("#content"),
		content_list = $("#list-of-content"),
		note 	= $("#note"),
		finded  = $("#finded");

	function error() {
	}

	function list(el, path) {
`
<ul id="list-of-content">
	<!-- <li>
		<a href="#">
			<h2>Lorem Ipsum - это текст-"рыба", часто используемый в печати и вэб-дизайне. Lorem Ipsum является стандартной "рыбой" </h2>
		</a>
		<div class="hashtags">
			<ul>
				<li><a href="#">#some 1</a></li>
				<li><a href="#">#some 2</a></li>
				<li><a href="#">#some 3</a></li>
				<li><a href="#">#some 4</a></li>
				<li><a href="#">#some 5</a></li>
			</ul>
		</div>
	</li> -->
</ul>
`
		let li 	= document.createElement("li"),
			a  	= document.createElement('a'),
			h2 	= document.createElement('h2'),
			div = document.createElement("div"),
			ul  = document.createElement("ul");

		div.classList.add("hashtags");

		if (path.length == 2) {
			a.setAttribute("href", `/#${path[0]}-${path[1]}`);
		}

		h2.innerText = el["name"];
		a.appendChild(h2);
		li.appendChild(a);

		if (path.length == 3) {
			a.setAttribute("href", `/#${path[0]}-${path[1]}-${path[2]}`);
			for (let hashtag of el["hashtags"]) {
				//console.log("hashtag", hashtag);
				let li_ = document.createElement("li"),
					a_	= document.createElement('a');

				a_.setAttribute("href", '#');
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
		if (current_note == null || current_note.length < 2) {
			$.ajax({
				url: "notes/HELLO.md",
				dataType: "text",
				success: (data) => {
					html = CONVERTER.makeHtml(data);
					note.html(html);
				}
			});
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
							let ul = addCodeLineNumbers(el, count);

							note.append(ul);
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
				THEMES.push(DATA[section_key]["topics"][topic_key]["name"]);
				for (var note_key in DATA[section_key]["topics"][topic_key]["notes"]) {
					let el = DATA[section_key]["topics"][topic_key]["notes"][note_key];
					NOTES[el["name"]] = el["hashtags"];
				}
			}
		}

		find("");
		reload();
	});

	// reload();

	function find(value) {
		finded.html("");

		let text = '';
		`
		<ul id="finded">
			<a href="#"><li class="finded-note"> some 3 asd;kjf asdjf dkjf sdksjd f</li></a>
			<a href="#"><li class="finded-thema">some 4</li></a>
		`

		for (let ind in THEMES) {
			if (THEMES[ind].toLowerCase().indexOf(value) != -1) {
				text += `<a href="#"><li class="finded-thema">${THEMES[ind]}</li></a>`;
			}
		}

		for (let name in NOTES) {
			if (name .toLowerCase().indexOf(value) != -1) {
				text += `<a href="#"><li class="finded-note">${name}</li></a>`;
			}
		}

		finded.html(text);
	}
	
	$("#search-input").on("input", (e) => {
		find(e.target.value.toLowerCase());
	});
	
	$(window).on('hashchange', (e) => {
		reload();
	});
});
