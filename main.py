import os
import re
from typing import List

from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse, JSONResponse

from pipeline import (
    process_unsorted_directory,
    UNSORTED_DIR,
    sanitize_filename,
    BASE_DIR,
    CATEGORIES,
)
from database import DatabaseManager

db = DatabaseManager()

app = FastAPI(title="ETL Pipeline API")

#########################
# API Endpoints         #
#########################


@app.post("/upload")
async def upload_files(
    background_tasks: BackgroundTasks, files: List[UploadFile] = File(...)
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
    background_tasks.add_task(process_unsorted_directory, UNSORTED_DIR)
    return {"status": "Files uploaded", "files": saved_files}


@app.get("/files/{parent}")
def list_files(parent: str):
    try:
        files = dict(db.find_file(parent))
        files["_id"] = str(files["_id"])
        return JSONResponse(content=files)
    except:
        raise HTTPException(status_code=404, detail="Invalid parent")


@app.get("/files/{parent}/{filename}")
def download_file(parent: str, filename: str):
    try:
        parent_entry = dict(db.find_file(parent))
        if not parent_entry.get("folder", False):
            raise HTTPException(status_code=400, detail="Parent is not a folder")

        file_entry = next(
            (f for f in parent_entry.get("children", []) if f["name"] == filename), None
        )
        if not file_entry:
            raise HTTPException(status_code=404, detail="File not found in this folder")

        parent_path = (
            parent_entry["name"]
            if file_entry["category"] == parent_entry["name"]
            else os.path.join(category, parent_entry["name"])
        )
        file_path = os.path.join(BASE_DIR, parent_path, filename)

        print(file_path)
        if not os.path.isfile(file_path):
            raise HTTPException(status_code=404, detail="File not found on disk")

        return FileResponse(file_path, filename=filename)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
