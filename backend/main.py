import sqlite3
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datasource import init_db, get_db_connection

# 1. Define the modern lifespan context manager (fixes the deprecation warning)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # This runs exactly once when the server starts
    init_db()
    yield
    # Anything placed here would run when the server shuts down

# 2. Pass the lifespan into your FastAPI application instance
app = FastAPI(title="EventFlow Solutions API", lifespan=lifespan)

# 3. Configure CORS so your Next.js frontend can talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Define the expected data model for the POST request
class EnqueueRequest(BaseModel):
    student_id: str
    target_company: str

# 5. Core Endpoints

@app.post("/enqueue")
def enqueue_student(req: EnqueueRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if the student ID exists in the simulated CSV dataset
    student = cursor.execute("SELECT * FROM students WHERE Student_ID = ?", (req.student_id,)).fetchone()
    if not student:
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found in database")
        
    try:
        # Insert the student into the active queue
        cursor.execute(
            "INSERT INTO queues (student_id, target_company) VALUES (?, ?)", 
            (req.student_id, req.target_company)
        )
        conn.commit()
    except sqlite3.IntegrityError:
        # Prevent the same student from joining the queue multiple times simultaneously
        conn.close()
        raise HTTPException(status_code=409, detail="Student is already waiting in a queue")
        
    conn.close()
    return {"status": "success", "message": f"{student['Name']} successfully added to the {req.target_company} queue."}

@app.get("/queue/{company}")
def get_company_queue(company: str):
    conn = get_db_connection()
    # SQL JOIN to combine live queue times with student profiles from the CSV
    query = """
        SELECT q.student_id, s.Name, s.Major, s.Desired_Role, s.Est_Interaction_Time_Mins 
        FROM queues q
        JOIN students s ON q.student_id = s.Student_ID
        WHERE q.target_company = ?
        ORDER BY q.join_time ASC
    """
    queue_data = conn.execute(query, (company,)).fetchall()
    conn.close()
    
    # Convert SQLite row objects into standard dictionaries for the JSON response
    return {"queue": [dict(row) for row in queue_data]}

@app.get("/wait-time/{company}")
def calculate_wait_time(company: str):
    conn = get_db_connection()
    # Calculate the dynamic wait time based on the specific weights assigned to the queued students
    query = """
        SELECT SUM(s.Est_Interaction_Time_Mins) as total_wait, COUNT(*) as people_waiting
        FROM queues q
        JOIN students s ON q.student_id = s.Student_ID
        WHERE q.target_company = ?
    """
    result = conn.execute(query, (company,)).fetchone()
    conn.close()
    
    return {
        "company": company,
        "people_waiting": result["people_waiting"] or 0,
        "estimated_wait_minutes": result["total_wait"] or 0
    }