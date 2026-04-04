import http.server
import os

PORT = 3000
DIRECTORY = "/Users/aaron/Documents/CedarPhoenixGames/PetIo"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    def log_message(self, format, *args):
        pass

os.chdir(DIRECTORY)
with http.server.HTTPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()
