$(()=> {
	var LIST = {},
		CONVERTER = new showdown.Converter(),
		main_container = $("#main"),
		notes_list = $(".list");
	function reload() {
		var re = /\/#(\d*)/g;
		var	current_note = re.exec(window.location.href);
		if (current_note == null || current_note[1].length == 0) {
			$.ajax({
				url: "notes/HELLO.md",
				dataType: "text",
				success: (data) => {
					html = CONVERTER.makeHtml(data);
					main_container.html(html);
				}
			});
		} else {
			$.ajax({
				url: "notes/"+LIST[+current_note[1]],
				dataType: "text",
				success: (data) => {
					html = CONVERTER.makeHtml(data);
					main_container.html(html);
				}
			});
		}
	}
	$.getJSON("list.json", (json)=> {
		LIST = json;
		let text = '';
		for (let ind in LIST) {
			let element = LIST[ind];
			text += `<a href="#${ind}">${element.replace(".md", '')}</a>`;
		}
		notes_list.html(text);
		reload();
	});
	
	$("#search-input").on("input", (e) => {
		let value = e.target.value,
			current_list = [];

		let text = '';

		for (let ind in LIST) {
			let element = LIST[ind];
			if (element.indexOf(value) != -1) {
				text += `<a href="#${ind}">${element.replace(".md", '')}</a>`;
			}
		}
		notes_list.html(text);
	});
	
	$(window).on('hashchange', (e) => {
		reload();
	});
});
