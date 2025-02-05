db = db.getSiblingDB("file_database");

// Configuration
if (!db.config.findOne({ type: "settings" })) {
    print("Saving configuration to database...");
    db.config.insertOne({
        type: "settings",
        artists: [
            "vae victis", "rocket pig games", "tabletop legends", "dragon's trapper's lodge",
            "aeternum fabrica", "cast'n'play", "archvillain society", "titan forge", "scarlet crusade",
            "durgin paint forge", "⚙tridrob⚙", "artisan guild"
        ],
        ignore_words: [
            "supported", "unsupported", "presupported", "diorama", "2020", "2021", "2022", "2023",
            "2024", "2025", "january", "february", "march", "april", "may", "june", "july", "august",
            "september", "october", "november", "december", "v1", "v2", "v3", "edition", "model", "set",
            "version", "copy", "remake", "printable", "draft", "final", "wip", "lychee", "vol", "act",
            "miniatures", "stl"
        ],
        separators: ["-", "_", "+", ".", "="],
        categories: {
            "terrain": "Large scenery and location elements for tabletop games: buildings, ruins, trees, fences, walls, chests, market stalls, stone and wooden structures, architectural parts (doors, windows, columns, bridges), and battlefield props.",
            "basing": "Small decorative elements attached to miniatures' bases: loose objects like scattered weapons, coins, skulls, tiny plants, rocks, and small animals (rats, birds, rabbits) and pets.",
            "creature": "Fantasy and sci-fi monsters: beasts, undead, dragons, demons, insects, mutants, giant animals.",
            "character": "Playable characters and NPCs: humans, elves, dwarves, warriors, wizards, knights, adventurers."
        }
    });
} else {
    print("Configuration already exists.");
}

// File structure
if (!db.files.findOne({ name: "root_folder" })) {
    print("Initializing database...");
    db.files.insertMany([
        { name: "root_folder", category: "Root", folder: true, children: [] },
        { name: "terrain", category: "root_folder", folder: true, children: [] },
        { name: "basing", category: "root_folder", folder: true, children: [] },
        { name: "creature", category: "root_folder", folder: true, children: [] },
        { name: "character", category: "root_folder", folder: true, children: [] },
        { name: "unknown", category: "root_folder", folder: true, children: [] },
    ]);
} else {
    print("Database already exists.");
}

print("✅ MongoDB was seeded successfully!");
