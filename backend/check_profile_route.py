from app.main import app

for route in app.routes:
    if "/profile" in route.path:
        print(f"FOUND: {route.path}")
