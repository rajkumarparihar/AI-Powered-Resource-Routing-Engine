# 🌊 EventFlow Solutions

**Predictive Line Management & Real-Time Queue Algorithms**  
*Built for Hacklanta II 2026*

![EventFlow Solutions](Thumbnail01.jpg)

## The Problem
Major collegiate networking events and career fairs suffer from a primary bottleneck: physical lines. Recruiters are overwhelmed, and candidates spend hours standing in unstructured queues just to get a brief introduction. Time spent standing in line is time wasted *not* networking.

## Our Solution
**EventFlow Solutions** brings order to the chaos of the event floor by replacing physical lines with a digital, predictive queueing system. By digitizing the flow, we relieve candidate anxiety, optimize recruiter time, and turn unstructured crowds into measurable, actionable data.

### Core Features
*   **Live Queue Buffer:** Replaces physical lines with a digital check-in system. Candidates can see exactly how many people are ahead of them and their estimated wait time.
*   **The 30-Second Challenge:** A built-in pacing mechanism. When a recruiter pulls a candidate from the buffer, a glowing neon 30-second timer ensures the elevator pitch stays focused and fair, preventing bottlenecks.
*   **Real-Time Syncing:** Built to run locally on an event network, updating the recruiter dashboard instantly as the backend processes the queue.

## Tech Stack
*   **Frontend:** Next.js, React, Tailwind CSS (Dark Mode/Neon UI)
*   **Backend:** Python, FastAPI, Uvicorn
*   **Database:** SQLite

## The Mathematics of the Queue
To handle predictive line management, the FastAPI backend actively calculates wait times based on queue depth. The estimated wait time $E[W]$ for a new candidate joining a queue of $N$ people is modeled simply as the sum of expected interaction times:

$$ E[W] = \sum_{i=1}^{N} \mu_i $$

Where $\mu_i$ represents the allocated time for the $i$-th candidate in the queue. In our system, this is strictly enforced by the pacing mechanism of the **30-Second Challenge**, effectively capping $\mu$ to prevent event-wide bottlenecks.

## Running the Project Locally

### 1. Start the Backend (FastAPI)
Open a terminal and navigate to your backend directory:
```bash
# Install dependencies
pip install fastapi uvicorn sqlite3

# Run the backend server on your local network
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*The backend will now be running on `http://localhost:8000` (or your local IP).*

### 2. Start the Frontend (Next.js)
Open a second terminal and navigate to your frontend directory:
```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```
*The frontend will now be running on `http://localhost:3000`.*

---

### Hackathon Notes
During development, we encountered a severe Next.js/PostCSS compiler crash right before the deadline. To bypass the broken local build and ensure our UI matched our design, we injected the Tailwind CSS CDN directly into our Next.js `<head>` layout. This hackathon-style pivot allowed us to successfully demo our dark-mode aesthetic across the network!