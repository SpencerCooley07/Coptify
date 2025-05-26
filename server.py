# SERVER + DB
from http.server import HTTPServer, BaseHTTPRequestHandler
import ssl, socket, secrets
import mimetypes, json, os
import sqlite3
import subprocess

# AUTH
from datetime import datetime, timedelta
import bcrypt, jwt

class Coptify(BaseHTTPRequestHandler):
    # CORS OPTIONS
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_GET(self): 
        # SENDING STATIC FILES
        if not self.path.startswith('/api/'):
            if self.path.startswith('/src/'): file_path = self.path.lstrip('/')
            else: file_path = 'public/index.html'

            try:
                mime_type, _ = mimetypes.guess_type(file_path)
                if mime_type is None: mime_type = 'application/octet-stream'
                with open(file_path, 'rb') as f: content = f.read()
                self.send_response(200)
                self.send_header('Content-Type', mime_type)
                self.send_header('Content-Length', str(len(content)))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(content)

            except Exception as e:
                self.sendJSON(500, {'message': f'Internal Server Error: {e}'})
                return     

    def do_POST(self):
        contentLength = int(self.headers.get('Content-Length', 0))
        data = self.rfile.read(contentLength)

        try: data = json.loads(data.decode('utf-8'))
        except json.JSONDecodeError:
            self.sendJSON(400, {'message': 'Invalid JSON'})
            return
        
        if self.path == '/api/signup':
            username, email, password = data.get('username'), data.get('email'), data.get('password')

            if not (username or email or password):
                self.sendJSON(400, {'message': 'Missing fields'})
                return
            
            if cursor.execute(f"SELECT * FROM users WHERE username = '{username}'").fetchone():
                self.sendJSON(409, {'message': 'Username already in use'})
                return
            elif cursor.execute(f"SELECT * FROM users WHERE email = '{email}'").fetchone():
                self.sendJSON(409, {'message': 'Email already in use'})
                return
            
            try:
                hashedPassword = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
                token = jwt.encode({
                    'sub': username,
                    'exp': int((datetime.utcnow() + timedelta(hours=2)).timestamp()),
                    'iat': int(datetime.utcnow().timestamp())
                }, SECRET_KEY, 'HS256')
                cursor.execute("INSERT INTO users (username, email, hashedPassword) VALUES (?, ?, ?)", (username, email, hashedPassword))
                connection.commit()
                self.sendJSON(201, {'message': 'User created', 'token': token, 'username': username})

            except: self.sendJSON(500, {'message': 'Internal server error'})

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

    # DB CONNECTION
    connection = sqlite3.connect('coptify.sqlite')
    cursor = connection.cursor()

    print(cursor.execute(f"SELECT * FROM users WHERE username = 'spencer'").fetchone())

    # SERVER
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80))
    SERVER_IP = s.getsockname()[0]
    s.close()

    SERVER_ADDRESS = (SERVER_IP if input('Bind to all? (Y/N) ').lower() == "n" else '0.0.0.0', 8443)

    httpd = HTTPServer(SERVER_ADDRESS, Coptify)
    if os.path.exists('ssl'):
        httpd.socket = ssl.wrap_socket(
            httpd.socket,
            keyfile='ssl/key.pem',
            certfile='ssl/cert.pem',
            server_side=True
        )
        server_access = f'https://{SERVER_IP}:{SERVER_ADDRESS[1]}'
    else: server_access = f'http://{SERVER_IP}:{SERVER_ADDRESS[1]}'

    if os.name == "nt":
        if input('Put server address in clipboard? (Y/N) ').lower() == "y": subprocess.run(f'echo {server_access} | clip', shell=True, check=True)
        os.system('cls')
    if os.name == "posix":
        if input('Put server address in clipboard? (Y/N) ').lower() == "y":
            p = subprocess.Popen(['pbcopy'], stdin=subprocess.PIPE)
            p.stdin.write(server_access.encode())
            p.stdin.close()
        os.system('clear')

    print(f'Server running on: {server_access}')
    httpd.serve_forever()