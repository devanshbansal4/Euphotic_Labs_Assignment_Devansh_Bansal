import sqlite3 from "sqlite3";
sqlite3.verbose();
const DB_PATH = "./dishes.db";

const db = new sqlite3.Database(DB_PATH);


export function initDB() {
  const create = `
    CREATE TABLE IF NOT EXISTS dishes (
      dishId INTEGER PRIMARY KEY,
      dishName TEXT NOT NULL,
      imageUrl TEXT NOT NULL,
      isPublished INTEGER NOT NULL
    );
  `;

  db.exec(create, (err) => {
    if (err) {
      console.error("Error creating table:", err);
      return;
    }
    // We put in base values if it is empty. 
    db.get("SELECT COUNT(*) AS count FROM dishes", (err, row) => {
      if (err) {
        console.error("Count error:", err);
        return;
      }
      if (!row || row.count === 0) {
        const insert = `
          INSERT INTO dishes (dishId, dishName, imageUrl, isPublished) VALUES
            (1, 'White Sauce Pasta', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkglUKSbs88HqavkT68aDg13m_sO9ZXNWG8_l2XBjjSQ6UOoqTtBVwiTHPa8hSUF9A7z4&usqp=CAU', 1),
            (2, 'Aloo Tikki Burger', 'https://recipesblob.oetker.in/assets/e128feeadd6947d0a86e181bf9c6b488/1272x764/aloo-tikki-burger.jpg', 0),
            (3, 'Dope Margherita', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSX2w-6ljxAJtEImAJ4zBsRnou1CoSAVmgvQw&s', 1),
            (4, 'Russian Salad', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTS-wlesVgVXHsJcOwRDeqvI4LSDpbeNAFHVw&s', 0),
            (5, 'Red Velvet Cake', 'https://tinyurl.com/y2mb4em4', 1);
        `;
        db.exec(insert, (err) => {
          if (err) console.error("Populate error:", err);
          else console.log("SQLite: seeded initial data.");
        });
      }
    });
  });
}


export default db;