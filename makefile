VENV_DIR = .venv
BACKEND_DIR = etl-pipeline-backend
CLIENT_DIR = etl-pipeline-client

MONGO_CONTAINER_NAME = mongo-container

run-mongo:
	docker run --name $(MONGO_CONTAINER_NAME) -d -p 27017:27017 mongo
	docker exec -i $(MONGO_CONTAINER_NAME) mongosh < ./init-mongo.js

setup-venv:
	cd $(BACKEND_DIR) && python -m venv $(VENV_DIR)
	cd $(BACKEND_DIR) && source $(VENV_DIR)/bin/activate && pip install -r requirements.txt

run-backend:
	cd $(BACKEND_DIR) && source $(VENV_DIR)/bin/activate && uvicorn src.main:app --host 0.0.0.0 --port 8000

install-js:
	cd $(CLIENT_DIR) && npm install

run-frontend:
	cd $(CLIENT_DIR) && npm run dev

setup: run-mongo setup-venv install-js

app:
	(cd $(BACKEND_DIR) && source $(VENV_DIR)/bin/activate && uvicorn src.main:app --host 0.0.0.0 --port 8000) &
	(cd $(CLIENT_DIR) && npm run dev) &

clean-mongo:
	docker stop $(MONGO_CONTAINER_NAME)
	docker rm $(MONGO_CONTAINER_NAME)
