from pymongo import MongoClient

class DatabaseManager:
    def __init__(self, db_name="file_database"):
        self.client = MongoClient("mongodb://localhost:27017")
        self.db = self.client[db_name]
        self.files = self.db["files"]
        self.config = self.db["config"]

    def initialize_db(self):
        # Inicializace konfigurace
        if not self.config.find_one({"type": "settings"}):
            print("Saving configuration to database...")
            self.config.insert_one({
                "type": "settings",
                "artists": [
                    "vae victis", "rocket pig games", "tabletop legends", "dragon's trapper's lodge",
                    "aeternum fabrica", "cast'n'play", "archvillain society", "titan forge", "scarlet crusade",
                    "durgin paint forge", "⚙tridrob⚙", "artisan guild"
                ],
                "ignore_words": [
                    "supported", "unsupported", "presupported", "diorama", "2020", "2021", "2022", "2023",
                    "2024", "2025", "january", "february", "march", "april", "may", "june", "july", "august",
                    "september", "october", "november", "december", "v1", "v2", "v3", "edition", "model", "set",
                    "version", "copy", "remake", "printable", "draft", "final", "wip", "lychee", "vol", "act",
                    "miniatures", "stl"
                ],
                "separators": ["-", "_", "+", ".", "="],
                "categories": {
                    "terrain": "Large scenery and location elements for tabletop games: buildings, ruins, trees, fences, walls, chests, market stalls, stone and wooden structures, architectural parts (doors, windows, columns, bridges), and battlefield props.",
                    "basing": "Small decorative elements attached to miniatures' bases: loose objects like scattered weapons, coins, skulls, tiny plants, rocks, and small animals (rats, birds, rabbits) and pets.",
                    "creature": "Fantasy and sci-fi monsters: beasts, undead, dragons, demons, insects, mutants, giant animals.",
                    "character": "Playable characters and NPCs: humans, elves, dwarves, warriors, wizards, knights, adventurers."
                }
            })
        else:
            print("Configuration already exists.")
        
        if not self.files.find_one({"name": "root_folder"}):
            print("Initializing database...")
            self.files.insert_one({"name": "root_folder", "category": "Root", "folder": True, "children": []})
        else:
            print("Database already exists.")

    def get_config(self):
        return self.config.find_one({"type": "settings"}, {"_id": 0})
    
    def insert_file(self, name, category, folder=True, parent_id=None):
        file_data = {
            "name": name,
            "category": category,
            "folder": folder,
            "children": [],
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

    def find_file(self, name):
        return self.files.find_one({"name": name})

    def update_file(self, file_id, new_data):
        self.files.update_one({"_id": file_id}, {"$set": new_data})

    def delete_file(self, file_id):
        self.files.delete_one({"_id": file_id})
        
    def reset_database(self):
        self.client.drop_database(self.db.name)
        print(f"🚨 Database {self.db.name} was removed.")
        self.__init__(self.db.name)
        self.initialize_db()

if __name__ == "__main__":
    db = DatabaseManager()
    # db.reset_database()
    db.initialize_db()
    print("✅ Database created or exists.")
