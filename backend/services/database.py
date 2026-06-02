import sqlite3
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "data" / "sehat.db"


def init_db():
    DB_PATH.parent.mkdir(exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS patient_records (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id      TEXT,
            token_number    INTEGER,
            patient_name    TEXT,
            patient_age     INTEGER,
            complaint       TEXT,
            duration        TEXT,
            severity        TEXT,
            triage_level    TEXT,
            department      TEXT,
            final_summary   TEXT,
            action          TEXT,
            language        TEXT,
            escalated       INTEGER DEFAULT 0,
            created_at      TEXT
        )
    """)
    conn.commit()
    conn.close()


def save_patient(data: dict):
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        INSERT INTO patient_records
        (session_id, token_number, patient_name, patient_age, complaint, duration,
         severity, triage_level, department, final_summary, action, language, escalated, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.get("session_id"),
        data.get("token_number"),
        data.get("patient_name"),
        data.get("patient_age"),
        data.get("complaint"),
        data.get("duration"),
        data.get("severity"),
        data.get("triage_level"),
        data.get("department"),
        data.get("final_summary"),
        data.get("action"),
        data.get("language", "en"),
        1 if data.get("escalated") else 0,
        datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    ))
    conn.commit()
    conn.close()


def get_all_records(limit: int = 100):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        "SELECT * FROM patient_records ORDER BY created_at DESC LIMIT ?", (limit,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_today_count():
    conn = sqlite3.connect(DB_PATH)
    today = datetime.now().strftime("%Y-%m-%d")
    count = conn.execute(
        "SELECT COUNT(*) FROM patient_records WHERE created_at LIKE ?", (f"{today}%",)
    ).fetchone()[0]
    conn.close()
    return count
