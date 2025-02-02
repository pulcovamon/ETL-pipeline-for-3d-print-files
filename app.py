import os
import time
import zipfile
import py7zr
import trimesh
import streamlit as st
from pyunpack import Archive
from werkzeug.utils import secure_filename

# Cesta pro ukládání souborů
base_directory = "/run/media/monika/VERBATIM HD/STLs/datalake"

# Funkce pro extrakci souborů
def extract_file(file_path, dest_dir):
    if file_path.endswith('.zip'):
        with zipfile.ZipFile(file_path, 'r') as zip_ref:
            zip_ref.extractall(dest_dir)
    elif file_path.endswith('.rar'):
        Archive(file_path).extractall(dest_dir)
    elif file_path.endswith('.7z'):
        with py7zr.SevenZipFile(file_path, mode='r') as z:
            z.extractall(path=dest_dir)

# Funkce pro zpracování nahraného souboru
def process_file(file_path):
    extract_dir = os.path.join(base_directory, os.path.splitext(file_path)[0])
    if not os.path.exists(extract_dir):
        os.makedirs(extract_dir)
    extract_file(file_path, extract_dir)

    # Rekurzivní extrakce souborů
    for root, dirs, files in os.walk(extract_dir):
        for file in files:
            if file.endswith('.zip') or file.endswith('.rar') or file.endswith('.7z'):
                extract_file(os.path.join(root, file), extract_dir)

# Streamlit aplikace
st.title("Komprimované soubory a STL modely")
st.write("Nahrávejte soubory a aplikace je automaticky zpracuje")

# Nahrávání souboru
uploaded_file = st.file_uploader("Vyberte soubor", type=["zip", "rar", "7z", "stl"])

if uploaded_file is not None:
    # Uložíme nahraný soubor na disk
    filename = secure_filename(uploaded_file.name)
    file_path = os.path.join(base_directory, filename)
    
    with open(file_path, "wb") as f:
        f.write(uploaded_file.getbuffer())
    
    # Spustíme zpracování souboru
    with st.spinner("Zpracovávám soubor..."):
        process_file(file_path)
        st.success("Soubor byl zpracován!")

    # Pokud je soubor STL, zobrazíme ho
    if filename.endswith('.stl'):
        st.write("Zobrazuji STL model...")
        mesh = trimesh.load_mesh(file_path)
        st.write(mesh.show())
