# Это тестовая запись

* Посмотрим, что получится

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

```
for i in range(5):
	print(i*2)
```
