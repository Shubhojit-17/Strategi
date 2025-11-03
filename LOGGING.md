# Logging and Auditing Best Practices - Implementation Guide

## Overview
This project implements enterprise-grade logging and auditing for blockchain-based AI agents.

## Log Files Structure

### 1. Application Logs (`logs/app.log`)
- **Format**: JSON (structured logging)
- **Rotation**: 10MB max, 5 backups
- **Content**: All application events (DEBUG level and above)
- **Use case**: Development debugging, general monitoring

### 2. Error Logs (`logs/error.log`)
- **Format**: JSON
- **Rotation**: 10MB max, 10 backups  
- **Content**: Errors and critical issues only
- **Use case**: Error tracking, alerting, incident response

### 3. Blockchain Logs (`logs/blockchain.log`)
- **Format**: JSON
- **Rotation**: 50MB max, 20 backups
- **Content**: All blockchain transactions and contract interactions
- **Fields**:
  - `tx_hash`: Transaction hash
  - `did`: Agent DID
  - `gas_used`: Gas consumed
  - `block_number`: Block number
  - `operation`: Operation type (register, record_provenance, etc.)
  - `status`: SUCCESS/FAILED

### 4. Audit Trail (`logs/audit.log`)
- **Format**: JSON
- **Rotation**: Daily, 90-day retention
- **Content**: Critical security and compliance events
- **Use case**: Compliance audits, security investigations
- **Events logged**:
  - Blockchain transactions
  - AI executions
  - Access control decisions
  - IPFS uploads

## Log Entry Format

All logs use structured JSON format:

```json
{
  "timestamp": "2025-11-01T19:51:32.123456",
  "level": "INFO",
  "logger": "app.chains",
  "message": "Agent registered successfully",
  "module": "chains",
  "function": "register_agent",
  "line": 145,
  "tx_hash": "0xabc123...",
  "did": "did:key:z6Mk...",
  "gas_used": 2152079,
  "block_number": 217416599
}
```

## Key Features

### 1. Performance Monitoring
Use the `@log_performance` decorator to track function execution time:

```python
from app.logging_config import log_performance

@log_performance
async def slow_function():
    # Function execution time is automatically logged
    pass
```

### 2. Audit Trail
Use the `AuditLogger` for compliance tracking:

```python
audit_logger.log_blockchain_tx(
    operation="register_agent",
    tx_hash="0x123...",
    did="did:key:z6Mk...",
    gas_used=2152079,
    status="SUCCESS"
)

audit_logger.log_ai_execution(
    did="did:key:z6Mk...",
    prompt_hash="0xabc...",
    response_hash="0xdef...",
    model="ollama-phi",
    tokens=150
)

audit_logger.log_access(
    user_id="0x123...",
    resource="nft_123",
    action="execute",
    granted=True,
    reason="NFT ownership verified"
)
```

### 3. Transaction Logging
All blockchain operations are logged with full details:

```python
from app.logging_config import log_transaction

log_transaction(
    logger,
    operation="mint_nft",
    tx_hash="0x123...",
    receipt=receipt,
    token_id=123,
    owner="0xabc..."
)
```

## Log Analysis

### Query Logs with jq
```bash
# Find all failed transactions
cat logs/blockchain.log | jq 'select(.status == "FAILED")'

# Calculate average gas usage
cat logs/blockchain.log | jq -s 'map(.gas_used) | add / length'

# Find transactions by DID
cat logs/blockchain.log | jq 'select(.did == "did:key:z6Mk...")'

# Get all errors in last hour
cat logs/error.log | jq 'select(.timestamp > "'$(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S)'")'
```

### Monitor in Real-Time
```bash
# Watch all logs
tail -f logs/app.log | jq

# Watch blockchain transactions only
tail -f logs/blockchain.log | jq

# Watch errors
tail -f logs/error.log | jq
```

## Security Best Practices

### 1. Log Sanitization
- **Never log**: Private keys, passwords, JWT tokens
- **Hash before logging**: User data, sensitive content
- **Redact**: Email addresses, wallet addresses in public logs

### 2. Access Control
- Restrict log file access to authorized users only
- Use separate credentials for log aggregation systems
- Encrypt logs at rest for compliance

### 3. Retention Policies
- **Application logs**: 5 backups (50MB total)
- **Error logs**: 10 backups (100MB total)
- **Blockchain logs**: 20 backups (1GB total)
- **Audit logs**: 90 days

### 4. Alerting
Set up alerts for:
- Error rate spikes
- Failed transaction rate > 5%
- Gas usage anomalies
- Unauthorized access attempts
- System performance degradation

## Integration with Monitoring Tools

### ELK Stack (Elasticsearch, Logstash, Kibana)
```yaml
# logstash.conf
input {
  file {
    path => "/path/to/logs/*.log"
    codec => json
  }
}

filter {
  if [tx_hash] {
    mutate {
      add_tag => ["blockchain"]
    }
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "somnia-agents-%{+YYYY.MM.dd}"
  }
}
```

### Grafana Dashboard
Create dashboards for:
- Transaction success rate
- Average gas usage over time
- AI execution frequency by agent
- Response time percentiles
- Error rate by endpoint

### Prometheus Metrics
Export key metrics:
- `blockchain_tx_total{status="success|failed"}`
- `blockchain_gas_used_total`
- `ai_execution_duration_seconds`
- `ipfs_upload_bytes_total`
- `http_request_duration_seconds`

## Compliance

### GDPR
- Log retention: 90 days for audit logs
- Right to erasure: Pseudonymize user data
- Data minimization: Only log necessary fields

### SOC 2
- Audit trail: All critical operations logged
- Access control: Log all access decisions
- Monitoring: Real-time alerting on anomalies
- Retention: 90-day audit trail

## Debugging Guide

### Common Issues

**Issue**: Logs not appearing
- Check `LOG_LEVEL` environment variable
- Verify log directory permissions
- Check disk space

**Issue**: Log rotation not working
- Verify write permissions
- Check filesystem space
- Restart application

**Issue**: Performance impact
- Reduce log level in production (INFO or WARNING)
- Use log sampling for high-volume endpoints
- Consider async log shipping

## Environment Variables

```bash
# Set log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
LOG_LEVEL=INFO

# Custom log directory
LOG_DIR=./logs

# Enable/disable specific loggers
DISABLE_BLOCKCHAIN_LOGGING=false
DISABLE_AUDIT_LOGGING=false
```

## Best Practices Summary

1. ✅ **Use structured logging** (JSON format)
2. ✅ **Log all blockchain transactions** with gas and status
3. ✅ **Maintain audit trail** for compliance
4. ✅ **Monitor performance** with execution timing
5. ✅ **Rotate logs** to prevent disk fill
6. ✅ **Sanitize sensitive data** before logging
7. ✅ **Set up alerts** for critical issues
8. ✅ **Review logs regularly** for anomalies
9. ✅ **Test log aggregation** before production
10. ✅ **Document log format** for team

## Next Steps

1. Set up log aggregation (ELK/EFK stack)
2. Create Grafana dashboards for monitoring
3. Configure alerting rules
4. Implement log sampling for high-traffic endpoints
5. Set up automated log analysis
6. Create incident response playbooks
