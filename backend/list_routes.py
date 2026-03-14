from app.main import app

for route in app.routes:
    methods = getattr(route, 'methods', 'MOUNT/STATIC')
    print(f"{route.path} {methods}")
