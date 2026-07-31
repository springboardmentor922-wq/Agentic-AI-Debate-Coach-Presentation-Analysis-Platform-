import http.server
import socketserver
import mimetypes

PORT = 8080

Handler = http.server.SimpleHTTPRequestHandler

# Fix for Windows MIME types issue
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("serving at port", PORT)
    httpd.serve_forever()
