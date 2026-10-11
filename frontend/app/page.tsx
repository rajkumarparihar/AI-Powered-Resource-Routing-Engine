"use client";

import React, { useState, useEffect } from "react";
import { Users, Clock, Zap, Play, RotateCcw, Building2 } from "lucide-react";

interface Student {
  student_id: string;
  Name: string;
  Major: string;
  Desired_Role: string;
  Est_Interaction_Time_Mins: number;
}

export default function Dashboard() {
  const [queue, setQueue] = useState<Student[]>([]);
  const [waitTimeData, setWaitTimeData] = useState({ people_waiting: 0, estimated_wait_minutes: 0 });
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const targetCompany = "Cox Automotive";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const queueRes = await fetch(`http://10.200.37.67:8000/queue/${encodeURIComponent(targetCompany)}`);
        if (queueRes.ok) {
          const queueJson = await queueRes.json();
          setQueue(queueJson.queue || []);
        }

        const waitRes = await fetch(`http://10.200.37.67:8000/wait-time/${encodeURIComponent(targetCompany)}`);
        if (waitRes.ok) {
          const waitJson = await waitRes.json();
          setWaitTimeData({
            people_waiting: waitJson.people_waiting,
            estimated_wait_minutes: waitJson.estimated_wait_minutes,
          });
        }
      } catch (err) {
        console.error("Backend fetch error:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [targetCompany]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const handleSelectRandom = () => {
    if (queue.length === 0) return;
    const pool = queue.slice(0, Math.min(5, queue.length));
    const randomPick = pool[Math.floor(Math.random() * pool.length)];
    setSelectedStudent(randomPick);
    setTimeLeft(30);
    setIsRunning(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <header className="max-w-7xl mx-auto flex justify-between items-center pb-8 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-400">
            EventFlow Solutions
          </h1>
          <p className="text-slate-400 text-sm mt-1">Predictive Line Management</p>
        </div>
        <div className="flex gap-6 bg-slate-900 border border-slate-800 px-5 py-3 rounded-xl">
          <div className="flex items-center gap-2"><Building2 className="w-5 h-5 text-indigo-400" /> <span>{targetCompany}</span></div>
          <div className="flex items-center gap-2"><Users className="w-4 h-4 text-emerald-400" /> <span>Wait: {waitTimeData.people_waiting}</span></div>
          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-400" /> <span>{waitTimeData.estimated_wait_minutes} mins</span></div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8 mt-8">
        <section className="col-span-7 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 text-slate-200">Live Queue Buffer</h2>
          <div className="space-y-3">
            {queue.length === 0 ? (
              <p className="text-slate-500 text-sm">No candidates currently enqueued.</p>
            ) : (
              queue.map((student, idx) => (
                <div key={student.student_id} className="flex justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
                  <div>
                    <h3 className="font-semibold text-slate-100">{idx + 1}. {student.Name}</h3>
                    <p className="text-xs text-slate-400">{student.Major} • {student.Desired_Role}</p>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">~{student.Est_Interaction_Time_Mins} min</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="col-span-5 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold mb-6 text-slate-200">30-Second Challenge</h2>
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl mb-6 min-h-[120px]">
              {selectedStudent ? (
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{selectedStudent.Name}</h3>
                  <p className="text-sm text-slate-400">{selectedStudent.Major}</p>
                  <p className="text-xs text-slate-500 mt-2">ID: {selectedStudent.student_id}</p>
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center mt-6">Select a candidate to begin.</p>
              )}
            </div>
            <div className={`text-7xl font-mono font-black text-center py-6 ${timeLeft <= 5 ? "text-rose-500" : "text-emerald-400"}`}>
              00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </div>
          </div>
          <div className="space-y-3">
            <button onClick={handleSelectRandom} disabled={queue.length === 0} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium">
              Select Random Candidate
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setIsRunning(true)} disabled={isRunning || timeLeft === 0 || !selectedStudent} className="py-3 bg-emerald-600 rounded-xl font-medium">Start Pitch</button>
              <button onClick={() => { setIsRunning(false); setTimeLeft(30); }} className="py-3 bg-slate-800 rounded-xl font-medium border border-slate-700">Reset</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}