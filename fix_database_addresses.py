import sqlite3
import os

db_path = 'agent/data/documents.db'

print(f"Opening database: {db_path}")
print(f"Database exists: {os.path.exists(db_path)}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check current data
cursor.execute('SELECT COUNT(*) FROM documents')
total = cursor.fetchone()[0]
print(f"\nTotal documents: {total}")

cursor.execute('SELECT user_address, filename FROM documents LIMIT 5')
print("\nCurrent addresses:")
for addr, fname in cursor.fetchall():
    print(f"  {addr} - {fname}")

# Update addresses to lowercase
cursor.execute('UPDATE documents SET user_address = LOWER(user_address)')
updated = cursor.rowcount
print(f"\nUpdated {updated} rows")

conn.commit()

# Verify update
cursor.execute('SELECT user_address, filename FROM documents LIMIT 5')
print("\nUpdated addresses:")
for addr, fname in cursor.fetchall():
    print(f"  {addr} - {fname}")

# Also update sync_status
cursor.execute('UPDATE sync_status SET user_address = LOWER(user_address)')
sync_updated = cursor.rowcount
print(f"\nUpdated {sync_updated} sync_status rows")

conn.commit()
conn.close()

print("\n✅ Database addresses normalized to lowercase")
