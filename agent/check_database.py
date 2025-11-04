import sqlite3
import os

db_path = "data/documents.db"
if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [row[0] for row in cursor.fetchall()]
print(f"Tables: {tables}")

# Get indexes
cursor.execute("SELECT name FROM sqlite_master WHERE type='index'")
indexes = [row[0] for row in cursor.fetchall()]
print(f"Indexes: {indexes}")

# Get column info for documents table
cursor.execute("PRAGMA table_info(documents)")
columns = cursor.fetchall()
print(f"\nDocuments table columns:")
for col in columns:
    print(f"  {col[1]} {col[2]}")

# Get column info for sync_status table
cursor.execute("PRAGMA table_info(sync_status)")
columns = cursor.fetchall()
print(f"\nSync_status table columns:")
for col in columns:
    print(f"  {col[1]} {col[2]}")

# Check if there are any documents
cursor.execute("SELECT COUNT(*) FROM documents")
count = cursor.fetchone()[0]
print(f"\nTotal documents: {count}")

conn.close()
print("\nDatabase structure verified successfully!")
