import os
import re
import shutil
import zipfile
from typing import List

import py7zr
from pyunpack import Archive
from transformers import pipeline

from .database import DatabaseManager

db = DatabaseManager()
config = db.get_config()

classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

inv_categories = {v: k for k, v in config["categories"].items()}
config["ignore_words"].extend(config["artists"])

BASE_DIR = os.getenv("DATALAKE_PATH", "datalake")
UNSORTED_DIR = os.path.join(BASE_DIR, "unsorted")
CATEGORIES = list(config["categories"].keys())
CATEGORIES.append("unknown")


os.makedirs(UNSORTED_DIR, exist_ok=True)
for cat in CATEGORIES:
    os.makedirs(os.path.join(BASE_DIR, cat), exist_ok=True)

#########################
# ETL Functions         #
#########################

def extract_file(file_path: str, dest_dir: str):
    if file_path.endswith('.zip'):
        with zipfile.ZipFile(file_path, 'r') as zip_ref:
            zip_ref.extractall(dest_dir)
    elif file_path.endswith('.rar'):
        Archive(file_path).extractall(dest_dir)
    elif file_path.endswith('.7z'):
        with py7zr.SevenZipFile(file_path, mode='r') as z:
            z.extractall(path=dest_dir)
    else:
        print(f"File {file_path} cannot be extracted.")

def classify_file(filename: str) -> str:
    filename = filename.split(".")[0].lower()
    for separator in config["separators"]:
        filename = filename.replace(separator, " ")
    for word in config["ignore_words"]:
        filename = re.sub(rf"\b{word}\b", "", filename, flags=re.IGNORECASE).strip()
    filename = re.sub(r"\d+", "", filename).strip()
    result = classifier(filename, list(config["categories"].values()))
    predicted_description = result['labels'][0]
    category = inv_categories.get(predicted_description, "unknown")
    probability = result['scores'][0]
    print(f"Classification: {filename} -> {category} (Probability: {probability:.2f})")
    if probability < 0.4:
        category = "unknown"
    return category

def sanitize_filename(filename: str) -> str:
    return filename.replace(" ", "_")

def process_file(file_path: str, category: str = None):
    dirname, filename = os.path.split(file_path)
    new_filename = sanitize_filename(filename)
    new_path = os.path.join(dirname, new_filename)
    if new_path != file_path:
        os.rename(file_path, new_path)
        file_path = new_path

    ext = os.path.splitext(file_path)[-1].lower()
    if ext in ['.zip', '.rar', '.7z']:
        folder_name = new_filename.split(".")[0]
        if db.find_file(folder_name):
            raise ValueError("Item with this name already exists!")
        extract_dir = os.path.join(dirname, os.path.splitext(new_filename)[0])
        os.makedirs(extract_dir, exist_ok=True)
        extract_file(file_path, extract_dir)

        if not category:
            category = classify_file(new_filename)
        category_dir = os.path.join(BASE_DIR, category)
        os.makedirs(category_dir, exist_ok=True)
        os.remove(file_path)
        
        parent = db.get_category(category)
        parent_id = parent["_id"]
        item_dir = extract_dir.split("/")[-1]
        children = []
        for root, dirs, files in os.walk(extract_dir):
            for f in files:
                src = os.path.join(root, f)
                if f.split(".")[1] not in ["png", "jpg", "jpeg", "stl", "lys", "pdf", "blend"]:
                    os.remove(src)
                    continue
                dst = os.path.join(category_dir, item_dir, f)
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                shutil.move(src, dst)
                children.append({
                    "name": f,
                    "category": category,
                    "folder": False,
                })
        db.insert_file(folder_name, category, parent_id=parent_id, children=children)
        shutil.rmtree(extract_dir)
        
        print(f"{item_dir} moved do {category}")
    elif ext == ".stl":
        if not category:
            category = classify_file(new_filename)
        category_dir = os.path.join(BASE_DIR, category)
        os.makedirs(category_dir, exist_ok=True)
        shutil.move(new_path, os.path.join(BASE_DIR, category, new_filename))
        parent_id = db.get_category(category)["_id"]
        db.insert_file(new_filename, category, folder=False, parent_id=parent_id)
        print(f"File {new_filename} moved to {category}")
    else:
        print(f"File {new_filename} has unsupported type.")

def process_unsorted_directory(base_dir: str, category: str = None):
    for root, dirs, files in os.walk(base_dir):
        for filename in files:
            file_path = os.path.join(root, filename)
            try:
                process_file(file_path, category)
            except Exception as e:
                print(f"An exception occured during processing {file_path}: {e}")
