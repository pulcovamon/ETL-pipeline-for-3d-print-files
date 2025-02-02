# ETL pipeline for processing 3d print files

## Run app

### Run MongoDB in docker
```
docker run --name mongo-container -d -p 27017:27017 mongo
```

### Create venv and install packages
```
python -m venv .venv
pip install -r requirements
```

### Create root directory for 3d print files
```
mkdir datalake
```

### Create database
```
python database.py
```

### Run uvicorn app
```
uvicorn main:app --host 0.0.0.0 --port 8000
```
