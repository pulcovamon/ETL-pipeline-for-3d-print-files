import os
import re
from typing import List

from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse, JSONResponse

from pipeline import process_unsorted_directory, UNSORTED_DIR, sanitize_filename

app = FastAPI(title="ETL Pipeline API")

#########################
# API Endpoints         #
#########################

@app.post("/upload")
async def upload_files(background_tasks: BackgroundTasks, files: List[UploadFile] = File(...)):
    saved_files = []
    for upload in files:
        ext = os.path.splitext(upload.filename)[1].lower()
        if ext not in ['.stl', '.zip', '.rar', '.7z', '.png', '.jpg', '.jpeg']:
            raise HTTPException(status_code=400, detail=f"Unsupported file: {upload.filename}.")
        save_path = os.path.join(UNSORTED_DIR, sanitize_filename(upload.filename))
        with open(save_path, "wb") as f:
            content = await upload.read()
            f.write(content)
        saved_files.append(upload.filename)

    background_tasks.add_task(process_unsorted_directory, UNSORTED_DIR)
    return {"status": "Files uploaded", "files": saved_files}

@app.get("/files/{category}")
def list_files(category: str):
    if category not in CATEGORIES:
        raise HTTPException(status_code=404, detail=f"Category {category} does not exist!")
    category_dir = os.path.join(BASE_DIR, category)
    if not os.path.exists(category_dir):
        raise HTTPException(status_code=404, detail=f"Category {category} does not exist!")
    files = os.listdir(category_dir)
    return {"category": category, "files": files}
