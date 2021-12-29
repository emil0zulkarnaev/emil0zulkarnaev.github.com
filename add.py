import os
from sys import argv
from json import loads, dumps

"""
Итоговый файл
Массив со словарями:
    - id
    - Заголовок
    - Название файла

Генерация

Открыть уже существующий итоговый файл, если он есть в текущей директории (list.json)
Прошерстить указанную директорию, либо в текущей найти директорию notes
Собрать список файлов
Определить новые файлы
Для каждого нового файла взять первую строку c заголовком
Добавить в итоговый файл

Команда запуска
python add.py [директория]

Файлы должны иметь расширение md или html

"""

if __name__ == "__main__":
    data = None 
    try:
        with open("list.json", 'r', encoding="utf-8") as file:
            data = loads(file.read())
    except:
        data = {"files": []}

    dir_ = ''
    if len(argv) == 2:
        dir_ = argv[1]
        if dir_[-1] != '/': dir_ += '/'
    else:
        dir_ = "./notes/"

    files = os.listdir(dir_)

    names = [x["file_name"] for x in data["files"]]
    ids   = [int(x["id"]) for x in data["files"]]
    max_id = 0
    if len(ids) > 0: max_id = max(ids)

    for file in files:
        if file in names: continue
        if ".md" not in file and ".html" not in file: continue

        header = file.replace(".html", '')
        if ".md" in file:
            try:
                with open(dir_+file, 'r') as file_:
                    header = file_.readline().replace('#', '').strip()
            except:
                header = file.replace(".md", '')

        print("new file:", file, "["+header+"]")

        max_id += 1
        data["files"].append({
            "file_name": file,
            "id": max_id,
            "header": header
            })
        
    with open("list.json", 'w', encoding="utf-8") as file:
        file.write(dumps(data))

"""
    if len(argv) == 2:
        try:
            with open("list.json", 'r', encoding="utf-8") as file:
                text = file.read()
        except:
            text = ""
        if len(text) == 0:
            list_ = {}
            mx = 0
        else:
            list_ = loads(text)
            mx = max([int(x) for x in list(list_.keys())])
        names = [list_[x] for x in list_]
        if argv[1] in names:
            print("Запись с таким названием уже существует")
        else:
            list_[mx+1] = argv[1]
            with open("list.json", 'w', encoding="utf-8") as file:
                file.write(dumps(list_))
                """
