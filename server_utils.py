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
    match input('SERVER UTILS\n1. Upload song\n2. Bulk upload songs\n3. Bulk upload to playlist\n> '):
        case '1':
            clear()
            path = input('File Location: ')
            filename = path.split('/')[-1]
            if os.path.exists(path):
                songID = str(uuid.uuid4())
                name, artist = input('Name: '), input('Artist: ')
                shutil.copy(path, CURRENT_DIR + f'/src/assets/songs/{songID}.mp3')
                cursor.execute("INSERT INTO songs (songID, name, artist) VALUES (?, ?, ?)", (songID, name, artist))
                connection.commit(), print('Copied '+f'src/songs/{filename}')
                runProgram = False if input('Exit? (Y/N) ') == "y" else True
            else: runProgram = False if input('Invalid file path, exit? (Y/N) ') == "y" else True

        case '2':
            clear()
            print('The input directory must contain a\n• list.csv\n• All Songs')
            print('The list file must contian songs separated by rows, and each row contains "name, artist, filename"\n')
            path = input('Input Directory: ')
            if os.path.exists(path) and os.path.exists(path + '/list.csv'):
                with open(path + '/list.csv', 'r') as inputList:
                    for line in inputList:
                        line = line.strip('\n').split(',')

                        songID = str(uuid.uuid4())
                        shutil.copy(path + f'/{line[2]}', CURRENT_DIR + f'/src/assets/songs/{songID}.mp3')
                        cursor.execute("INSERT INTO songs (songID, name, artist) VALUES (?, ?, ?)", (songID, line[0], line[1]))
                        print(f'{songID}, {line[0]}, {line[1]}')

                    connection.commit()
                print('Songs Uploaded!')
                runProgram = False if input('Exit? (Y/N) ') == "y" else True
            else: runProgram = False if input('Invalid file path, exit? (Y/N) ') == "y" else True

        case '3':
            clear()
            print('The input directory must contain a\n• list.csv\n• All Songs')
            print('The list file must contian songs separated by rows, and each row contains "name, artist, filename"\n')
            path = input('Input Directory: ')
            playlistName = input('Playlist Name: ')

            if os.path.exists(path) and os.path.exists(path + '/list.csv'):
                playlistID = str(uuid.uuid4())

                cursor.execute("INSERT INTO playlists (playlistID, curator, name, isPublic) VALUES (?, ?, ?, ?)", (playlistID, 'Coptify', playlistName, 1))
                connection.commit()

                with open(path + '/list.csv', 'r') as inputList:
                    for i, line in enumerate(inputList):
                        line = line.strip('\n').split(',')

                        songID = str(uuid.uuid4())

                        shutil.copy(path + f'/{line[2]}', CURRENT_DIR + f'/src/assets/songs/{songID}.mp3')
                        cursor.execute("INSERT INTO songs (songID, name, artist) VALUES (?, ?, ?)", (songID, line[0], line[1]))
                        cursor.execute("INSERT INTO playlistSongs (playlistID, songID, position) VALUES (?, ?, ?)", (playlistID, songID, i+1))
                        print(f'{songID}, {line[0]}, {line[1]}')

                    connection.commit()
                print(f'Playlist ({playlistName}) Uploaded!')
                runProgram = False if input('Exit? (Y/N) ') == "y" else True
            else: runProgram = False if input('Invalid file path, exit? (Y/N) ') == "y" else True

        case 'exit': runProgram = False
        case _:
            runProgram = False if input('Invalid, exit? (Y/N) ') == "y" else True