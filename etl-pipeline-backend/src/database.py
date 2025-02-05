import os

from pymongo import MongoClient

class DatabaseManager:
    def __init__(self, db_name="file_database"):
        uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/file_database")
        self.client = MongoClient(uri)
        self.db = self.client[db_name]
        self.files = self.db["files"]
        self.config = self.db["config"]

    def get_config(self):
        return self.config.find_one({"type": "settings"}, {"_id": 0})
    
    def insert_file(self, name, category, folder=True, parent_id=None, children=[]):
        file_data = {
            "name": name,
            "category": category,
            "folder": folder,
            "children": children,
        }
        if parent_id:
            parent = self.files.find_one({"_id": parent_id})
            if parent and "children" in parent:
                parent["children"].append(file_data)
                self.files.update_one({"_id": parent_id}, {"$set": {"children": parent["children"]}})
            else:
                return None
        else:
            self.files.insert_one(file_data)
        return file_data
    
    def get_category(self, category):
        return self.files.find_one({"name": category})

    def find_file(self, name):
        result = self.files.find_one(
            {"children.name": name},
            {"children.$": 1}
        )
        print(result)
        return result["children"][0] if result else None

    def update_file(self, file_id, new_data):
        self.files.update_one({"_id": file_id}, {"$set": new_data})

    def delete_file(self, file_id):
        self.files.delete_one({"_id": file_id})

