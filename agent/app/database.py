"""
Document Cache Database Manager
Provides SQLite-based caching for blockchain document events
"""

import sqlite3
import logging
import os
from typing import List, Dict, Optional, Any
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)


class DocumentDatabase:
    """
    SQLite database manager for document cache
    Stores document metadata fetched from blockchain for fast retrieval
    """
    
    def __init__(self, db_path: str = None):
        """
        Initialize database connection
        
        Args:
            db_path: Path to SQLite database file (defaults to ./agent/data/documents.db)
        """
        if db_path is None:
            db_path = os.getenv("DATABASE_PATH", "./data/documents.db")
        
        self.db_path = db_path
        
        # Create data directory if it doesn't exist
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        
        # Initialize database
        self.init_db()
        logger.info(f"Document database initialized: {db_path}")
    
    def get_connection(self) -> sqlite3.Connection:
        """Get database connection with row factory"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # Access columns by name
        return conn
    
    def init_db(self):
        """Create database tables if they don't exist"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            # Documents table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS documents (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_address TEXT NOT NULL,
                    document_id INTEGER NOT NULL,
                    filename TEXT NOT NULL,
                    ipfs_hash TEXT NOT NULL,
                    document_hash TEXT NOT NULL,
                    token_id INTEGER NOT NULL,
                    timestamp INTEGER NOT NULL,
                    tx_hash TEXT NOT NULL,
                    block_number INTEGER NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_address, document_id)
                )
            ''')
            
            # Create indexes for performance
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_user_address 
                ON documents(user_address)
            ''')
            
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_block_number 
                ON documents(block_number)
            ''')
            
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_tx_hash 
                ON documents(tx_hash)
            ''')
            
            # Sync status table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS sync_status (
                    user_address TEXT PRIMARY KEY,
                    last_synced_block INTEGER NOT NULL,
                    last_sync_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.commit()
            logger.info("Database tables created successfully")
            
        except Exception as e:
            logger.error(f"Error creating database tables: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()
    
    def insert_document(self, doc: Dict[str, Any]) -> bool:
        """
        Insert a document into cache
        
        Args:
            doc: Document dictionary with all required fields
            
        Returns:
            True if inserted, False if already exists or error
        """
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO documents 
                (user_address, document_id, filename, ipfs_hash, document_hash, 
                 token_id, timestamp, tx_hash, block_number)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                doc['user_address'].lower(),
                doc['document_id'],
                doc['filename'],
                doc['ipfs_hash'],
                doc['document_hash'],
                doc['token_id'],
                doc['timestamp'],
                doc['tx_hash'],
                doc['block_number']
            ))
            
            conn.commit()
            inserted = cursor.rowcount > 0
            
            if inserted:
                logger.debug(f"Inserted document {doc['document_id']} for user {doc['user_address']}")
            
            return inserted
            
        except Exception as e:
            logger.error(f"Error inserting document: {e}")
            conn.rollback()
            return False
        finally:
            conn.close()
    
    def insert_documents_batch(self, documents: List[Dict[str, Any]]) -> int:
        """
        Insert multiple documents in a batch
        
        Args:
            documents: List of document dictionaries
            
        Returns:
            Number of documents inserted
        """
        if not documents:
            return 0
        
        conn = self.get_connection()
        cursor = conn.cursor()
        inserted_count = 0
        
        try:
            for doc in documents:
                cursor.execute('''
                    INSERT OR IGNORE INTO documents 
                    (user_address, document_id, filename, ipfs_hash, document_hash, 
                     token_id, timestamp, tx_hash, block_number)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    doc['user_address'],
                    doc['document_id'],
                    doc['filename'],
                    doc['ipfs_hash'],
                    doc['document_hash'],
                    doc['token_id'],
                    doc['timestamp'],
                    doc['tx_hash'],
                    doc['block_number']
                ))
                inserted_count += cursor.rowcount
            
            conn.commit()
            logger.info(f"Batch inserted {inserted_count} documents")
            return inserted_count
            
        except Exception as e:
            logger.error(f"Error in batch insert: {e}")
            conn.rollback()
            return 0
        finally:
            conn.close()
    
    def get_user_documents(self, user_address: str) -> List[Dict[str, Any]]:
        """
        Get all documents for a user from cache
        
        Args:
            user_address: Ethereum address of user
            
        Returns:
            List of document dictionaries
        """
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT document_id, filename, ipfs_hash, document_hash,
                       token_id, timestamp, tx_hash, block_number
                FROM documents
                WHERE user_address = ?
                ORDER BY timestamp DESC
            ''', (user_address.lower(),))
            
            rows = cursor.fetchall()
            
            documents = []
            for row in rows:
                documents.append({
                    'document_id': row['document_id'],
                    'filename': row['filename'],
                    'ipfs_hash': row['ipfs_hash'],
                    'document_hash': row['document_hash'],
                    'token_id': row['token_id'],
                    'timestamp': row['timestamp'],
                    'tx_hash': row['tx_hash'],
                    'block_number': row['block_number']
                })
            
            logger.debug(f"Retrieved {len(documents)} documents for user {user_address}")
            return documents
            
        except Exception as e:
            logger.error(f"Error retrieving documents: {e}")
            return []
        finally:
            conn.close()
    
    def get_last_synced_block(self, user_address: str) -> Optional[int]:
        """
        Get the last block number synced for a user
        
        Args:
            user_address: Ethereum address of user
            
        Returns:
            Last synced block number or None if never synced
        """
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT last_synced_block
                FROM sync_status
                WHERE user_address = ?
            ''', (user_address.lower(),))
            
            row = cursor.fetchone()
            return row['last_synced_block'] if row else None
            
        except Exception as e:
            logger.error(f"Error getting last synced block: {e}")
            return None
        finally:
            conn.close()
    
    def update_sync_status(self, user_address: str, block_number: int):
        """
        Update the last synced block for a user
        
        Args:
            user_address: Ethereum address of user
            block_number: Block number synced up to
        """
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT OR REPLACE INTO sync_status 
                (user_address, last_synced_block, last_sync_time)
                VALUES (?, ?, CURRENT_TIMESTAMP)
            ''', (user_address.lower(), block_number))
            
            conn.commit()
            logger.debug(f"Updated sync status for {user_address}: block {block_number}")
            
        except Exception as e:
            logger.error(f"Error updating sync status: {e}")
            conn.rollback()
        finally:
            conn.close()
    
    def clear_user_cache(self, user_address: str):
        """
        Clear all cached documents for a user (used when tamper detected)
        
        Args:
            user_address: Ethereum address of user
        """
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            # Delete documents
            cursor.execute('''
                DELETE FROM documents
                WHERE user_address = ?
            ''', (user_address.lower(),))
            
            # Delete sync status
            cursor.execute('''
                DELETE FROM sync_status
                WHERE user_address = ?
            ''', (user_address.lower(),))
            
            conn.commit()
            logger.warning(f"Cleared cache for user {user_address}")
            
        except Exception as e:
            logger.error(f"Error clearing cache: {e}")
            conn.rollback()
        finally:
            conn.close()
    
    def get_document_by_tx(self, tx_hash: str) -> Optional[Dict[str, Any]]:
        """
        Get a document by transaction hash
        
        Args:
            tx_hash: Transaction hash
            
        Returns:
            Document dictionary or None if not found
        """
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT document_id, user_address, filename, ipfs_hash, document_hash,
                       token_id, timestamp, tx_hash, block_number
                FROM documents
                WHERE tx_hash = ?
            ''', (tx_hash.lower(),))
            
            row = cursor.fetchone()
            
            if row:
                return {
                    'document_id': row['document_id'],
                    'user_address': row['user_address'],
                    'filename': row['filename'],
                    'ipfs_hash': row['ipfs_hash'],
                    'document_hash': row['document_hash'],
                    'token_id': row['token_id'],
                    'timestamp': row['timestamp'],
                    'tx_hash': row['tx_hash'],
                    'block_number': row['block_number']
                }
            return None
            
        except Exception as e:
            logger.error(f"Error getting document by tx: {e}")
            return None
        finally:
            conn.close()
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics
        
        Returns:
            Dictionary with cache statistics
        """
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            # Total documents
            cursor.execute('SELECT COUNT(*) as count FROM documents')
            total_docs = cursor.fetchone()['count']
            
            # Total users
            cursor.execute('SELECT COUNT(DISTINCT user_address) as count FROM documents')
            total_users = cursor.fetchone()['count']
            
            # Database size
            cursor.execute("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()")
            db_size = cursor.fetchone()['size']
            
            return {
                'total_documents': total_docs,
                'total_users': total_users,
                'database_size_bytes': db_size,
                'database_size_mb': round(db_size / (1024 * 1024), 2)
            }
            
        except Exception as e:
            logger.error(f"Error getting cache stats: {e}")
            return {}
        finally:
            conn.close()
