import os
import re
from typing import List

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from .pipeline import (
    process_unsorted_directory,
    UNSORTED_DIR,
    sanitize_filename,
    BASE_DIR,
    CATEGORIES,
)
from .database import DatabaseManager

db = DatabaseManager()

app = FastAPI(title="ETL Pipeline API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NewCategory(BaseModel):
    name: str

#########################
# API Endpoints         #
#########################

@app.post("/upload")
async def upload_files(
    background_tasks: BackgroundTasks, files: List[UploadFile] = File(...), category: str = None, flatten: bool = True
):
    saved_files = []
    for upload in files:
        ext = os.path.splitext(upload.filename)[1].lower()
        if ext not in [".stl", ".zip", ".rar", ".7z", ".png", ".jpg", ".jpeg"]:
            raise HTTPException(
                status_code=400, detail=f"Unsupported file: {upload.filename}."
            )
        save_path = os.path.join(UNSORTED_DIR, sanitize_filename(upload.filename))
        with open(save_path, "wb") as f:
            content = await upload.read()
            f.write(content)
        saved_files.append(upload.filename)
    background_tasks.add_task(process_unsorted_directory, UNSORTED_DIR, category, flatten)
    return {"status": "Files uploaded", "files": saved_files}


@app.get("/files/{category}")
def list_files(category: str):
    try:
        files = dict(db.get_category(category))
        files["_id"] = str(files["_id"])
        return JSONResponse(content=files)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Category does not exist!")
    
    
@app.get("/categories")
def get_categories():
    categories = dict(db.get_category("datalake"))["children"]
    return JSONResponse(categories)
    
    
@app.post("/categories")
def create_category(category: NewCategory):
    root = dict(db.get_category("datalake"))
    if category.name in root["children"]:
        raise HTTPException(status_code=403, detail="Category already exists!")
    root["children"].append(category.name)
    db.update_file(root["_id"], root)
    data = db.insert_file(category.name, category="")
    data["_id"] = str(data["_id"])
    return JSONResponse(data)


@app.get("/files/{category}/{filename}")
def download_file(category: str, filename: str, parent: str=None):
    try:
        if parent:
            filename = os.path.join(parent, filename)
        file_path = os.path.join(BASE_DIR, category, filename)

        print(file_path)
        if not os.path.isfile(file_path):
            raise HTTPException(status_code=404, detail="File not found on disk")

        return FileResponse(file_path, filename=filename)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)