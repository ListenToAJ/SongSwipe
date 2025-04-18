"""
Python script to help with Spotify data collection.
Will have a prompt that lets you select left or right for each song and will keep track of the time
Writes to a csv in the data folder with the name 'data/{name}_{playlist}_spotify.csv'
It is recomended that you rename the auto generated files from the app to the same scheme so its not just random strings. 
"""
import time
import csv

name = input('Enter a name: ')
playlist = input('Enter a playlist name: ')

with open(f'data/{name}_{playlist}_spotify.csv', 'w', newline='') as f:
    song_num = 1
    writer = csv.writer(f)
    writer.writerow(['song_num', 'time(Sec)', 'decision'])

    while True:
        # Data collecting
        start_time = time.time()
        decision = input('Enter one of the following characters: l (left), r (right), d (done): ')
        while decision not in ['l', 'r', 'd']: 
            decision = input('Enter one of the following characters: l (left), r (right), d (done): ')
        
        # change decision variable to be full word, here so you dont have to type the whole word out
        if decision == 'd': break
        elif decision == 'l': decision = 'left'
        elif decision == 'r': decision = 'right'
        
        decision_time = round(time.time() - start_time)
        
        print(f'Song {song_num}, Decision {decision}, Time {decision_time}')

        writer.writerow([song_num, decision_time, decision])
        song_num += 1

    print(f'Testing completed, {song_num} songs made decisions on.')
