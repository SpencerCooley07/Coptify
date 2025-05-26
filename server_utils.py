# FOR UPLOADING SONGS AND PLAYLISTS

import sqlite3
import uuid
import os, shutil

def clear():
    if os.name == "nt": os.system('cls')
    elif os.name == "posix": os.system('clear')

CURRENT_DIR = '/'.join(os.path.abspath(__file__).split('/')[:-1])
connection = sqlite3.connect('coptify.sqlite')
cursor = connection.cursor()

runProgram = True

while runProgram == True:
    clear()
    match input('SERVER UTILS\n1. Upload song\n2. Bulk upload songs\n3. Upload playlist\n> '):
        case '1':
            path = input('File Location: ')
            filename = path.split('/')[-1]
            if os.path.exists(path):
                songID = str(uuid.uuid4())
                name, artist = input('Name: '), input('Artist: ')
                shutil.copy(path, CURRENT_DIR + f'/src/assets/songs/{songID}.mp3')
                cursor.execute("INSERT INTO songs (songID, name, artist) VALUES (?, ?, ?)", (songID, name, artist))
                connection.commit(), print('Copied '+f'src/songs/{filename}')
                runProgram = False if input('Exit? (Y/N) ') == "y" else True

        case _:
            runProgram = False if input('Invalid, exit? (Y/N) ') == "y" else True