import sqlite3
import pandas as pd
import os

DB_NAME = "eventflow.db"
CSV_FILE = "../career_fair_1000.csv"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS queues (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT NOT NULL,
            target_company TEXT NOT NULL,
            join_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(student_id)
        )
    ''')
    if os.path.exists(CSV_FILE):
        df = pd.read_csv(CSV_FILE)
        df.to_sql('students', conn, if_exists='replace', index=False)
    conn.commit()
    conn.close()

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn