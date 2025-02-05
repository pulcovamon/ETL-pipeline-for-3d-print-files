# ETL pipeline for processing 3d print files

## Run app

### Run MongoDB in docker
```
docker run --name mongo-container -d -p 27017:27017 mongo
docker exec -i mongo-container mongosh < ./init-mongo.js
```

### Create venv and install packages
```
cd etl-pipeline-backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements
```

### Run uvicorn app
```
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

### Install js packages
```
cd etl-pipeline-client
npm install
```

### Run React app
```
npm run dev
```