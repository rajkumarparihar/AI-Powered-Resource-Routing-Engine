import sqlite3
import pandas as pd

def seed_active_queue():
    # Connect to your SQLite database
    conn = sqlite3.connect("eventflow.db")
    cursor = conn.cursor()
    
    # Read the first 10 students from your generated dataset
    try:
        df = pd.read_csv("../career_fair_1000.csv").head(10)
    except FileNotFoundError:
        print("Error: Could not find career_fair_1000.csv. Make sure it is in the main EventFlow_Solutions folder.")
        return
    
    # Insert each student into the queue
    for _, row in df.iterrows():
        student_id = row['Student_ID']
        try:
            cursor.execute(
                "INSERT INTO queues (student_id, target_company) VALUES (?, ?)", 
                (student_id, "Cox Automotive")
            )
            print(f"Added {row['Name']} to the queue.")
        except sqlite3.IntegrityError:
            print(f"{row['Name']} is already in the queue.")
            
    conn.commit()
    conn.close()
    print("Queue successfully seeded!")

if __name__ == "__main__":
    seed_active_queue()