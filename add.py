from sys import argv
from json import loads, dumps

if __name__ == "__main__":
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
