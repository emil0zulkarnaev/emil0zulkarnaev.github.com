#!/usr/bin/python
#-*- coding:utf-8 -*-

import os
from sys import argv as ARGV, exit as EXIT
from json import loads, dumps

"""
{
	"main": {
		"1": "Наименование файла"
	},
	"1": {
		"name": "Название",
		"topics": {
			"1": {
				"name": "Название темы",
				"file_name": "Наименование файла",
				"hashtags": []
			},
		}
	}
}
"""

colors = {
        "red"       : "\033[31m\033[1m{}\033[0m",
        "green"     : "\033[32m\033[1m{}\033[0m",
        "yellow"    : "\033[33m\033[1m{}\033[0m",
        "turquoise" : "\033[36m\033[1m{}\033[0m",
        }

def c_print(text, color):
    global colors
    print(colors[color].format(text))

def c_input(text, color):
    global colors
    return input(colors[color].format(text))

class Data:
    def __init__(self):
        self.load()
        self.get_all()
        self.nodata = False
    
    def load(self):
        with open("list.json", 'r', encoding="utf-8") as file:
            text = file.read().strip()
            if len(text) == 0:
                self.nodata = True
                self.data = {"main": {}}
            else:
                self.data = loads(text)

    def save(self):
        with open("list.json", 'w', encoding="utf-8") as file:
            file.write(dumps(self.data))


    def get_all(self):
        self.files = []

        for key, section in self.data.items():
            if key == "main":
                for file_name in section.values():
                    self.files.append(file_name)
            else:
                for topic in section["topics"].values():
                    for note in topic["notes"].values():
                        self.files.append(note["file_name"])

    def find_new(self):
        files = os.listdir("./notes/")
        self.new_files = []

        for file in files:
            if file not in self.files:
                self.new_files.append(file)

    def hashtag(self):
        section_name = c_input("Введите название раздела (либо только часть): ", "green").strip()

        flag = False
        for section_key in self.data.keys():
            if section_key == "main": continue
            section = self.data[section_key]["name"]
            if section_name in section:
                if not flag: flag = True
                print(colors["yellow"].format(section_key), "->", section)

        if not flag:
            c_print("Подобного раздела нет", "red")
            return

        section_ind = c_input("Выберите раздел: ", "green").strip()
        if section_ind not in self.data.keys():
            c_print("Необходимо выбрать номер раздела", "red")
            return

        topic_name = c_input("Введите название темы (либо только часть): ", "green").strip()
        flag = False
        for topic_key in self.data[section_ind]["topics"].keys():
            topic = self.data[section_ind]["topics"][topic_key]["name"]
            if topic_name in topic:
                if not flag: flag = True
                print(colors["yellow"].format(topic_key), "->", topic)
        
        topic_ind = ""
        if not flag:
            c_print("Подобной темы нет", "red")
            return

        topic_ind = c_input("Выберите тему: ", "green").strip()
        if topic_ind not in self.data[section_ind]["topics"].keys():
            c_print("Необходимо выбрать номер темы", "red")
            return

        note_name = c_input("Введите название записи (либо только часть): ", "green").strip()
        flag = False
        for note_key in self.data[section_ind]["topics"][topic_ind]["notes"].keys():
            note = self.data[section_ind]["topics"][topic_ind]["notes"][note_key]["name"]
            if note_name in note:
                if not flag: flag = True
                print(colors["yellow"].format(note_key), "->", note)
        
        note_ind = ""
        if not flag:
            c_print("Подобной записи нет", "red")
            return

        note_ind = c_input("Выберите тему: ", "green").strip()
        if note_ind not in self.data[section_ind]["topics"][topic_ind]["notes"].keys():
            c_print("Необходимо выбрать номер записи", "red")
            return

        hashtags = c_input("Введите хештеги через пробел: ", "green").strip()
        if len(hashtags) == 0:
            c_print("Вы столько всего до этого прошли, дошли до сюдого и в итоге не ввели ничего?", "red")
            return

        current_hashtags = self.data[section_ind]["topics"][topic_ind]["notes"][note_ind]["hashtags"]
        hashtags = list(set([x for x in hashtags.split(' ')] + current_hashtags))
        self.data[section_ind]["topics"][topic_ind]["notes"][note_ind]["hashtags"] = hashtags
                

    def new(self, new_name):
        self.find_new()

        if len(self.new_files) == 0:
            c_print("Нет новых файлов для добавления чего-либо нового", "red")
            return

        for ind in range(len(self.new_files)):
            print(colors["yellow"].format(ind+1), "->", self.new_files[ind])
        try:
            new_file_ind = int(c_input("Выберите новый файл: ", "green").strip()) - 1
        except ValueError:
            c_print("Нужно было вводить число, что ты делаешь???.......", "red")
            return
        if new_file_ind < 0 or new_file_ind >= len(self.new_files):
            c_print("Необходимо ввести номер файла", "red")
            return
        
        section_name = c_input("Введите название раздела (либо только часть): ", "green").strip()
        if section_name == "main":
            main_keys = self.data["main"].keys()
            if len(main_keys) == 0:
                self.data["main"]["1"] = self.new_files[new_file_ind]
            else:
                self.data["main"][str(int(max(main_keys))+1)] = self.new_files[new_file_ind]
            return

        flag = False
        for section_key in self.data.keys():
            if section_key == "main": continue
            section = self.data[section_key]["name"]
            if section_name in section:
                if not flag: flag = True
                print(colors["yellow"].format(section_key), "->", section)

        section_ind = ""
        if not flag:
            yn = c_input("Раздела с похожим названием нет.\nВыбрать это название, как новое? (Yn): ", "turquoise").strip().lower()
            if yn in ["n", "no"]:
                section_name = c_input("Введите название нового раздела: ", "green").strip()
        else:
            section_ind = c_input("Выберите раздел: ", "green").strip()
            section_name = ""
            if section_ind not in self.data.keys():
                section_name = c_input("Раздела с таким номер пока нет.\nВведите название нового раздела:", "turquoise").strip()

        topic_name = ""
        topic_ind  = 0 
        if section_name != "":
            topic_name = c_input("Введите название новой темы: ", "green").strip()
        else:
            topic_name = c_input("Введите название темы (либо только часть): ", "green").strip()
            flag = False
            for topic_key in self.data[section_ind]["topics"].keys():
                topic = self.data[section_ind]["topics"][topic_key]["name"]
                if topic_name in topic:
                    if not flag: flag = True
                    print(colors["yellow"].format(topic_key), "->", topic)
            
            topic_ind = ""
            if not flag:
                yn = c_input("Темы с похожим названием нет.\nВыбрать это название, как новое? (Yn): ", "turquoise").strip().lower()
                if yn in ["n", "no"]:
                    topic_name = c_input("Темы с похожим названием нет.\nВведите название новой темы:", "turquoise").strip()
            else:
                topic_ind = c_input("Выберите тему: ", "green").strip()
                topic_name = ""
                if topic_ind not in self.data[section_ind]["topics"].keys():
                    topic_name = c_input("Темы с таким номер пока нет.\nВведите название новой темы:", "turquoise").strip()

        data_keys = [x for x in self.data.keys() if x != "main"]

        if section_name != "":
            section_ind = int(max(data_keys)) if len(data_keys) > 0 else 0
            section_ind = str(section_ind+1)
            self.data[section_ind] = {"name": section_name, "topics": {}}
            self.data[section_ind]["topics"]["1"] = {
                    "name": topic_name, 
                    "notes": {
                        "1": {
                            "name": new_name,
                            "file_name": self.new_files[new_file_ind], 
                            "hashtags": []
                            }
                        }
                    }
            return

        if topic_name != "":
            topic_ind   = int(max(self.data[str(section_ind)]["topics"].keys())) \
                        if len(data_keys) > 0 else 0
            topic_ind = str(topic_ind+1)
            self.data[str(section_ind)]["topics"][topic_ind] = {
                    "name": topic_name, 
                    "notes": {
                        "1": {
                            "name": new_name,
                            "file_name": self.new_files[new_file_ind], 
                            "hashtags": []
                            }
                        }
                    }
            return

        section_ind = section_ind
        topic_ind   = topic_ind
        note_ind = str(int(max(self.data[section_ind]["topics"][topic_ind]["notes"].keys()))+1)
        self.data[section_ind]["topics"][topic_ind]["notes"][note_ind] = {
                            "name": new_name,
                            "file_name": self.new_files[new_file_ind], 
                            "hashtags": []
                            } 

def not_enough_arguments():
    c_print("Не верная команда или не достаточно аргументов", "red")
    EXIT(1)

if __name__ == "__main__":
    d = Data()
    ln = len(ARGV)
    if ln >= 3 and ARGV[1] == "new":
        d.new(ARGV[2])
        d.save()
    elif ln >= 2 and ARGV[1] == "hashtag":
        d.hashtag()
        d.save()
    else:
        not_enough_arguments()

    if "--debug" in ARGV:
        from pprint import pprint
        pprint(d.data)
