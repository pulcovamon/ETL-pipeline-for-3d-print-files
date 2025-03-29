# ETL pipeline for processing 3d print files

## Run app with makefile (runs live server)

### setup
```
make setup
```
This will:
- run mongodb in container and fill it with initial values
    - `make run-mongo`
- create .venv and install python packages
    - `make setup-venv`
- install js packages
    - `make install-js`

### run app
```
make app
```
This will
- run fastapi app
    - `make run-backend`
- run react app
    -  `make run-frontend`

### cleanup
```
clean-mongo
```
This will:
- stop and remove mongo db container

## Run app with docker-compose
## Run backend and database
```
docker-compose -f docker-compose-dev.yml up -d --build
```
*note: it takes several minutes to build*

## Run whole app
```
docker-compose up -d --build
```

## Run each part manually
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