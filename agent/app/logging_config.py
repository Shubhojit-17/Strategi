"""
Comprehensive Logging and Auditing Configuration
Best practices for blockchain and AI application monitoring
"""
import logging
import sys
from pathlib import Path
from datetime import datetime
import json
from typing import Any, Dict
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler


class JSONFormatter(logging.Formatter):
    """Format logs as JSON for structured logging"""
    
    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
        }
        
        # Add exception info if present
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        
        # Add custom fields from extra
        if hasattr(record, 'tx_hash'):
            log_data['tx_hash'] = record.tx_hash
        if hasattr(record, 'did'):
            log_data['did'] = record.did
        if hasattr(record, 'gas_used'):
            log_data['gas_used'] = record.gas_used
        if hasattr(record, 'block_number'):
            log_data['block_number'] = record.block_number
        if hasattr(record, 'user_id'):
            log_data['user_id'] = record.user_id
        if hasattr(record, 'endpoint'):
            log_data['endpoint'] = record.endpoint
        if hasattr(record, 'status_code'):
            log_data['status_code'] = record.status_code
        if hasattr(record, 'duration_ms'):
            log_data['duration_ms'] = record.duration_ms
        
        return json.dumps(log_data)


class AuditLogger:
    """Specialized logger for audit trail events"""
    
    def __init__(self, log_dir: Path):
        self.logger = logging.getLogger('audit')
        self.logger.setLevel(logging.INFO)
        
        # Audit logs are critical - keep them for 90 days
        audit_file = log_dir / 'audit.log'
        handler = TimedRotatingFileHandler(
            audit_file,
            when='midnight',
            interval=1,
            backupCount=90,
            encoding='utf-8'
        )
        handler.setFormatter(JSONFormatter())
        self.logger.addHandler(handler)
    
    def log_blockchain_tx(self, operation: str, tx_hash: str, did: str = None,
                          gas_used: int = None, status: str = None, **kwargs):
        """Log blockchain transaction for audit trail"""
        self.logger.info(
            f"Blockchain operation: {operation}",
            extra={
                'tx_hash': tx_hash,
                'did': did,
                'gas_used': gas_used,
                'status': status,
                'operation': operation,
                **kwargs
            }
        )
    
    def log_ai_execution(self, did: str, prompt_hash: str, response_hash: str,
                         model: str, tokens: int = None, **kwargs):
        """Log AI execution for verifiability"""
        self.logger.info(
            f"AI execution by {did}",
            extra={
                'did': did,
                'prompt_hash': prompt_hash,
                'response_hash': response_hash,
                'model': model,
                'tokens': tokens,
                **kwargs
            }
        )
    
    def log_access(self, user_id: str, resource: str, action: str, 
                   granted: bool, reason: str = None):
        """Log access control decisions"""
        self.logger.info(
            f"Access {action} on {resource}: {'GRANTED' if granted else 'DENIED'}",
            extra={
                'user_id': user_id,
                'resource': resource,
                'action': action,
                'granted': granted,
                'reason': reason
            }
        )
    
    def log_ipfs_upload(self, cid: str, file_hash: str, size: int, did: str = None):
        """Log IPFS uploads for content tracking"""
        self.logger.info(
            f"IPFS upload: {cid}",
            extra={
                'cid': cid,
                'file_hash': file_hash,
                'size': size,
                'did': did
            }
        )


def setup_logging(log_dir: str = "logs", log_level: str = "INFO"):
    """
    Configure comprehensive logging for the application
    
    Creates multiple log files:
    - app.log: General application logs (rotating, 10MB max, 5 backups)
    - error.log: Errors and above (rotating, 10MB max, 10 backups)
    - audit.log: Audit trail (daily rotation, 90 day retention)
    - blockchain.log: Blockchain operations (rotating, 50MB max, 20 backups)
    """
    log_path = Path(log_dir)
    log_path.mkdir(exist_ok=True)
    
    # Root logger configuration
    root_logger = logging.getLogger()
    # Convert string log level to logging constant
    level = getattr(logging, log_level.upper() if isinstance(log_level, str) else log_level)
    root_logger.setLevel(level)
    
    # Console handler - human readable
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_format = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(console_format)
    root_logger.addHandler(console_handler)
    
    # Application log - JSON formatted, rotating
    app_handler = RotatingFileHandler(
        log_path / 'app.log',
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    app_handler.setLevel(logging.DEBUG)
    app_handler.setFormatter(JSONFormatter())
    root_logger.addHandler(app_handler)
    
    # Error log - separate file for errors
    error_handler = RotatingFileHandler(
        log_path / 'error.log',
        maxBytes=10*1024*1024,  # 10MB
        backupCount=10,
        encoding='utf-8'
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(JSONFormatter())
    root_logger.addHandler(error_handler)
    
    # Blockchain operations log - larger size, more retention
    blockchain_logger = logging.getLogger('blockchain')
    blockchain_handler = RotatingFileHandler(
        log_path / 'blockchain.log',
        maxBytes=50*1024*1024,  # 50MB
        backupCount=20,
        encoding='utf-8'
    )
    blockchain_handler.setFormatter(JSONFormatter())
    blockchain_logger.addHandler(blockchain_handler)
    blockchain_logger.setLevel(logging.INFO)
    
    # Initialize audit logger
    audit_logger = AuditLogger(log_path)
    
    logging.info(f"Logging initialized: {log_path.absolute()}")
    logging.info(f"Log level: {log_level}")
    
    return audit_logger


# Convenience function for blockchain operations
def log_transaction(logger: logging.Logger, operation: str, tx_hash: str,
                   receipt: Dict[str, Any] = None, **kwargs):
    """Log a blockchain transaction with full details"""
    log_data = {
        'operation': operation,
        'tx_hash': tx_hash,
        **kwargs
    }
    
    if receipt:
        log_data.update({
            'block_number': receipt.get('blockNumber'),
            'gas_used': receipt.get('gasUsed'),
            'status': 'SUCCESS' if receipt.get('status') == 1 else 'FAILED',
            'effective_gas_price': receipt.get('effectiveGasPrice'),
        })
    
    logger.info(
        f"Transaction {operation}: {tx_hash}",
        extra=log_data
    )


# Performance monitoring decorator
def log_performance(func):
    """Decorator to log function execution time"""
    import time
    import functools
    
    @functools.wraps(func)
    async def async_wrapper(*args, **kwargs):
        start = time.time()
        logger = logging.getLogger(func.__module__)
        try:
            result = await func(*args, **kwargs)
            duration = (time.time() - start) * 1000
            logger.info(
                f"{func.__name__} completed",
                extra={'duration_ms': duration, 'function': func.__name__}
            )
            return result
        except Exception as e:
            duration = (time.time() - start) * 1000
            logger.error(
                f"{func.__name__} failed after {duration:.2f}ms: {e}",
                extra={'duration_ms': duration, 'function': func.__name__}
            )
            raise
    
    @functools.wraps(func)
    def sync_wrapper(*args, **kwargs):
        start = time.time()
        logger = logging.getLogger(func.__module__)
        try:
            result = func(*args, **kwargs)
            duration = (time.time() - start) * 1000
            logger.info(
                f"{func.__name__} completed",
                extra={'duration_ms': duration, 'function': func.__name__}
            )
            return result
        except Exception as e:
            duration = (time.time() - start) * 1000
            logger.error(
                f"{func.__name__} failed after {duration:.2f}ms: {e}",
                extra={'duration_ms': duration, 'function': func.__name__}
            )
            raise
    
    if asyncio.iscoroutinefunction(func):
        return async_wrapper
    return sync_wrapper


import asyncio
