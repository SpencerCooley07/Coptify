# SERVER + DB
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn
import ssl, socket, secrets
import mimetypes, json, os
import sqlite3
import subprocess

# AUTH
import bcrypt, jwt

class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    """Handle requests in a separate thread."""
    daemon_threads = True

class CoptifyRequestHandler(BaseHTTPRequestHandler):
    # CORS OPTIONS
    def do_OPTIONS(self):
        # Allow others to access the website
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_GET(self):
        # Serve static content
        connection = sqlite3.connect('coptify.sqlite')
        cursor = connection.cursor()

        if not self.path.startswith('/api/'):
            if self.path.startswith('/src/'): file_path = self.path.lstrip('/')
            else: file_path = 'public/index.html'

            try:
                # Get the file mime_type for correct headers
                mime_type, _ = mimetypes.guess_type(file_path)
                if mime_type is None: mime_type = 'application/octet-stream'

                file_size = os.path.getsize(file_path)

                # Handle range requests for audio so that scrubbing works
                range_header = self.headers.get('Range')
                if mime_type.startswith('audio/') and range_header:
                    byte_range = range_header.strip().split('=')[-1]
                    start_str, end_str = byte_range.split('-')
                    start, end = int(start_str), min(int(end_str) if end_str else file_size - 1, file_size - 1)

                    length = end - start + 1

                    with open(file_path, 'rb') as f:
                        f.seek(start)
                        data = f.read(length)

                    self.send_response(206) # Partial Content response
                    self.send_header('Content-Type', mime_type)
                    self.send_header('Content-Range', f'bytes {start}-{end}/{file_size}')
                    self.send_header('Content-Length', str(length))
                    self.send_header('Accept-Ranges', 'bytes')
                    self.send_header('Connection', 'keep-alive') # Keeps a connection alive for scrubbing
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(data)
                    return

                # No range or non-audio: serve whole file
                with open(file_path, 'rb') as f: content = f.read()

                self.send_response(200)
                self.send_header('Content-Type', mime_type)
                self.send_header('Content-Length', str(len(content)))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(content)

            except Exception as e:
                self.sendJSON(500, {'message': f'Internal Server Error: {e}'})
            
        if self.path == "/api/getCoptifyPlaylists":
            # Grabs the playlistID, name, and description from the DB table "playlists" if the curator is Coptify (Official Playlists)
            allPlaylists = cursor.execute("SELECT playlistID, name, description FROM playlists WHERE curator = 'Coptify'").fetchall()
            self.sendJSON(200, {playlist[0]: {
                'name': playlist[1],
                'curator': 'Coptify',
                'description': playlist[2]
            } for playlist in allPlaylists})

        if self.path.startswith("/api/getPlaylistInformation/"):
            # Grabs the name, description, and curator for a specific playlist based on playlistID for the frontend
            playlistInfo = cursor.execute(f"SELECT name, description, curator FROM playlists WHERE playlistID = '{self.path.split('/')[-1]}'").fetchone()
            self.sendJSON(200, {
                'name': playlistInfo[0],
                'description': playlistInfo[1],
                'curator': playlistInfo[2]
            })

        if self.path.startswith("/api/getPlaylist/"):
            # Grabs necessary song information given a playlistID
            data = {}
            for song in cursor.execute(f"SELECT songID, position FROM playlistSongs WHERE playlistID = '{self.path.split('/')[-1]}'").fetchall():
                songInfo = cursor.execute(f"SELECT name, artist FROM songs WHERE songID = '{song[0]}'").fetchone()
                data[song[0]] = {
                    'name': songInfo[0],
                    'artist': songInfo[1],
                    'position': song[1]
                }
            self.sendJSON(200, data)

        if self.path.startswith("/api/getLikeStatus/"):
            authHeader = self.headers.get('Authorization')

            if not authHeader or not authHeader.startswith("Bearer "):
                self.sendJSON(401, {"message": "Missing or Invalid Authentication header"})
                return
            
            token = authHeader.split(' ')[1]

            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
                username = payload['sub']
            except jwt.InvalidTokenError:
                self.sendJSON(401, {"message": "Invalid token"})
                return
            
            songID = self.path.split('/')[-1]
            if not cursor.execute(f"SELECT username, songID FROM likes WHERE username='{username}' AND songID = '{songID}'").fetchone():
                self.sendJSON(200, {"message": "null"})
                return
            else:
                self.sendJSON(200, {"message": "liked"})
                return
            
        if self.path.startswith("/api/getSongMetadata/"):
            songID = self.path.split('/')[-1]
            songInfo = cursor.execute(f"SELECT name, artist FROM songs WHERE songID = '{songID}'").fetchone()
            playlistID = cursor.execute(f"SELECT playlistID FROM playlistSongs WHERE songID = '{songID}'").fetchone()
            if os.path.exists(f"/src/assets/songs/{songID}.png"): image_path = f"src/assets/songs/{songID}.png"
            elif playlistID: image_path = f"/src/assets/playlists/{playlistID[0]}.jpg"
            else: image_path = f"/src/assets/playlist.png"

            self.sendJSON(200, {"title": songInfo[0], "artist": songInfo[1], "image": image_path})
            return
        
        if self.path == "/api/getAllSongs":
            songs = cursor.execute("SELECT songID, name, artist FROM songs ORDER BY name ASC").fetchall()
            self.sendJSON(200, [{
                "id": song[0],
                "name": song[1],
                "artist": song[2]
            } for song in songs])
            return



    def do_POST(self):
        connection = sqlite3.connect('coptify.sqlite')
        cursor = connection.cursor()

        contentLength = int(self.headers.get('Content-Length', 0))
        data = {}

        if contentLength > 0:
            raw = self.rfile.read(contentLength)
            try:
                data = json.loads(raw.decode('utf-8'))
            except json.JSONDecodeError:
                self.sendJSON(400, {'message': 'Invalid JSON'})
                return

        if self.path == '/api/signup':
            username, email, password = data.get('username'), data.get('email'), data.get('password')

            if not (username or email or password):
                self.sendJSON(400, {'message': 'Missing fields'})
                return
            
            # Checks if user already exists
            if cursor.execute(f"SELECT * FROM users WHERE username = '{username}'").fetchone():
                self.sendJSON(409, {'message': 'Username already in use'})
                return
            elif cursor.execute(f"SELECT * FROM users WHERE email = '{email}'").fetchone():
                self.sendJSON(409, {'message': 'Email already in use'})
                return
            
            try:
                # Sends back a JWT token and adds user to DB
                hashedPassword = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
                token = jwt.encode({
                    'sub': username
                }, SECRET_KEY, 'HS256')
                cursor.execute("INSERT INTO users (username, email, hashedPassword) VALUES (?, ?, ?)", (username, email, hashedPassword))
                connection.commit()
                self.sendJSON(201, {'message': 'User created', 'token': token, 'username': username})

            except: self.sendJSON(500, {'message': 'Internal server error'})

        if self.path == '/api/login':
            email, password = data.get('email'), data.get('password')

            if not (email or password):
                self.sendJSON(400, {'message': 'Missing fields'})
                return
            
            # Verifies user information is correct (Guard Clauses)
            userData = cursor.execute(f"SELECT * FROM users WHERE email = '{email}'").fetchone()
            if not userData:
                self.sendJSON(409, {'message': "Account with that email doesn't exist"})
                return
            if not bcrypt.checkpw(password.encode('utf-8'), userData[2].encode('utf-8')):
                self.sendJSON(409, {'message': 'Incorrect password'})
                return
            
            # Sends back a JWT token for session management
            token = jwt.encode({
                'sub': userData[0]
            }, SECRET_KEY, 'HS256')
            self.sendJSON(201, {'message': 'Signed in', 'token': token, 'username': userData[0]})

        if self.path.startswith("/api/toggleSongLike/"):
            authHeader = self.headers.get('Authorization')

            if not authHeader or not authHeader.startswith("Bearer "):
                self.sendJSON(401, {"message": "Missing or Invalid Authentication header"})
                return
            
            token = authHeader.split(' ')[1]

            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
                username = payload['sub']
            except jwt.InvalidTokenError:
                self.sendJSON(401, {"message": "Invalid token"})
                return
            
            songID = self.path.split('/')[-1]
            if not cursor.execute(f"SELECT username, songID FROM likes WHERE username='{username}' AND songID = '{songID}'").fetchone():
                cursor.execute("INSERT INTO likes (username, songID) VALUES (?, ?)", (username, songID))
                connection.commit()
                self.sendJSON(200, {"message": "liked"})
                return
            else:
                cursor.execute(f"DELETE FROM likes WHERE username='{username}' AND songID = '{songID}'")
                connection.commit()
                self.sendJSON(200, {"message": "unliked"})
                return



    # UTIL FUNCTIONS
    def sendJSON(self, code: int, data: dict):
        responseBody = json.dumps(data).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(responseBody)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(responseBody)



if __name__ == "__main__":
    # SECRET KEY FOR JWT TOKEN
    if os.path.exists('secret.key'):
        with open('secret.key', 'r') as secret: SECRET_KEY = secret.read().strip()
    else: SECRET_KEY = secrets.token_hex(64)

    # SERVER
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80))
    SERVER_IP = s.getsockname()[0] # Grabs the IP of the host server
    s.close()

    SERVER_ADDRESS = (SERVER_IP if input('Bind to all? (Y/N) ').lower() == "n" else '0.0.0.0', 8443)
    httpd = ThreadingHTTPServer(SERVER_ADDRESS, CoptifyRequestHandler)

    # If HTTPS connection is available (certificates supplied) then hosts with HTTPS else HTTP
    if os.path.exists('ssl'):
        httpd.socket = ssl.wrap_socket(
            httpd.socket,
            keyfile='ssl/key.pem',
            certfile='ssl/cert.pem',
            server_side=True
        )
        protocol = 'https'
    else: protocol = 'http'

    server_access = f"{protocol}://{SERVER_IP}:{SERVER_ADDRESS[1]}"

    if input('Put server address in clipboard? (Y/N) ').lower() == "y":
        p = subprocess.Popen(['pbcopy'], stdin=subprocess.PIPE)
        p.stdin.write(server_access.encode())
        p.stdin.close()
    os.system('clear')

    print(f'Server running on: {server_access}')
    httpd.serve_forever()