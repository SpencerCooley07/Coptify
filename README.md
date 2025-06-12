# Coptify
Coptify is a song streaming website (SPA + CSR) which hosts a number of songs. Users are able to create accounts and sign in,
play songs, and create and listen to playlists. It aims to create a similar song streaming experience to Soundcloud/Spotify.
Coptify uses HTML, CSS, and JavaScript to implement the single page app and client side rendering, in addition to a Python HTTP backend server to serve the site and respond to API calls.  

## Note
Coptify is a school project intended to improve skills in website architecture design, UI, and Python HTTP server implementation.  
The songs for the Liturgies of St. Basil, St. Gregory, and St. Cyril that are uploaded to GitHub are from Tasbeha.org

# Using Coptify
First, you will need to clone this repository which will take some time due to the large size of the demo songs
`git clone https://github.com/SpencerCooley07/Coptify.git`

Next, you must cd into the "Coptify" folder
`cd Coptify`

After that, if you wish to set up a venv for installing the requirements feel free to do so.
Installing the requirements requires this code (using pip or pip3)
`pip3 install -r requirements.txt`

After that, it should be all set. Simply run the python.server (using python or python3)
`python3 server.py`

Finally, binding to all takes longer but allows other computers on the same LAN to access it.
There is also an option to copy the url to the clipboard.