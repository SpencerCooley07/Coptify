from http.server import HTTPServer, BaseHTTPRequestHandler
import ssl, socket, secrets
import mimetypes, json, os
import sqlite3

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

    def do_POST(self): pass

    # UTIL FUNCTIONS
    def sendJSON(self, code: int, data: dict):
        responseBody = json.dumps(data).encode('utf8')
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
    connection = sqlite3.connect('coptify.db')
    cursor = connection.cursor()

    # SERVER
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80))
    server_IP = s.getsockname()[0]
    s.close()

    server_address = (server_IP if input('Bind to all? (Y/N)\n').lower() == "n" else '0.0.0.0', 8443)

    httpd = HTTPServer(server_address, Coptify)
    httpd.socket = ssl.wrap_socket(
        httpd.socket,
        keyfile='ssl/key.pem',
        certfile='ssl/cert.pem',
        server_side=True
    )
    print('Server Running')
    httpd.serve_forever()