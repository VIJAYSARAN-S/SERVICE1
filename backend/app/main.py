from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import traceback
from app.database import Base, engine
from app.routes_auth import router as auth_router
from app.routes_service import router as service_router
from app.routes_admin import router as admin_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CyberSheild Secure E-Governance API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    with open("error_log.txt", "a") as f:
        f.write(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error"},
    )

app.include_router(auth_router)
app.include_router(service_router)
app.include_router(admin_router)

@app.get("/")
def root():
    return {"message": "CyberSheild backend running successfully"}