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

def extract_file(file_path: str, dest_dir: str, flatten: bool = False):
    def extract_archive(archive_path: str, extract_dir: str):
        """Extrahuje archiv, pokud je podporovaný (zip, rar, 7z)"""
        if archive_path.endswith('.zip'):
            with zipfile.ZipFile(archive_path, 'r') as zip_ref:
                zip_ref.extractall(extract_dir)
        elif archive_path.endswith('.rar'):
            Archive(archive_path).extractall(extract_dir)
        elif archive_path.endswith('.7z'):
            with py7zr.SevenZipFile(archive_path, mode='r') as z:
                z.extractall(path=extract_dir)
        else:
            print(f"File {archive_path} cannot be extracted.")
            return False
        return True

    def recursively_extract(archive_path: str, extract_dir: str):
        if not extract_archive(archive_path, extract_dir):
            return
        for root, dirs, files in os.walk(extract_dir):
            for directory in dirs:
                path = os.path.join(root, directory)
                new_path = os.path.join(root, sanitize_filename(directory))
                shutil.move(path, new_path)
            for file in files:
                file_path = os.path.join(root, file)
                if file.endswith(('.zip', '.rar', '.7z')):
                    new_file_path = os.path.join(root,sanitize_filename(file.split(".")[0]))
                    recursively_extract(file_path, new_file_path)
                else:
                    new_file_path = os.path.join(root, sanitize_filename(file))
                    shutil.move(file_path, new_file_path)

    extract_temp_dir = os.path.join(dest_dir, "temp_extracted")
    os.makedirs(extract_temp_dir, exist_ok=True)

    recursively_extract(file_path, extract_temp_dir)

    if flatten:
        for root, _, files in os.walk(extract_temp_dir):
            for file in files:
                shutil.move(os.path.join(root, file), os.path.join(dest_dir, file))
        shutil.rmtree(extract_temp_dir)
    else:
        shutil.move(extract_temp_dir, dest_dir)

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

def build_tree(root):
    tree = {
        "name": os.path.basename(root),
        "folder": True,
        "path": root.split(os.sep),
        "children": []
    }
    try:
        for entry in os.scandir(root):
            if entry.is_dir():
                tree["children"].append(build_tree(entry.path))
            elif os.path.splitext(entry)[-1].lower() in [".stl", ".png", ".jpg", ".jpeg", ".pdf", ".lys", ".blend", ".obj"]:
                    tree["children"].append({
                        "name": entry.name,
                        "folder": False,
                        "path": entry.path.split(os.sep)
                    })
    except PermissionError:
        pass  
    return tree

def build_directory_structure(root_path):
    return build_tree(root_path)

def process_file(file_path: str, category: str = None, flatten: bool = False):
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
        extract_dir = os.path.join(dirname, folder_name)
        os.makedirs(extract_dir, exist_ok=True)
        extract_file(file_path, extract_dir, flatten)

        if not category:
            category = classify_file(new_filename)
        category_dir = os.path.join(BASE_DIR, category)
        os.makedirs(category_dir, exist_ok=True)
        os.remove(file_path)

        parent = db.get_category(category)
        parent_id = parent["_id"]

        directory_structure = build_tree(extract_dir)

        db.insert_file(folder_name, category, parent_id=parent_id, children=directory_structure["children"])
        target_path = os.path.join(category_dir, folder_name)
        shutil.move(extract_dir, target_path)

        print(f"{folder_name} moved to {category}")
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

def process_unsorted_directory(base_dir: str, category: str = None, flatten: bool = False):
    for root, dirs, files in os.walk(base_dir):
        for filename in files:
            file_path = os.path.join(root, filename)
            try:
                process_file(file_path, category, flatten)
            except Exception as e:
                print(f"An exception occurred during processing {file_path}: {e}")
