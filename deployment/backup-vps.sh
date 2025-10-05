#!/bin/bash

###############################################################################
# FinMan VPS Backup Script
# This script creates backups of database and uploaded files
# Setup as a cron job for automated backups
###############################################################################

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
BACKUP_DIR="$HOME/backups/finman"
DB_NAME="finman_production"
DB_USER="finman_user"
UPLOAD_DIR="/var/www/finman/apps/finman/backend/uploads"
RETENTION_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE_ONLY=$(date +%Y%m%d)

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}FinMan Backup Script${NC}"
echo -e "${GREEN}========================================${NC}"

# Backup database
echo ""
echo "Backing up database..."
pg_dump -U "$DB_USER" -h localhost "$DB_NAME" > "$BACKUP_DIR/db_$TIMESTAMP.sql"
gzip "$BACKUP_DIR/db_$TIMESTAMP.sql"
echo -e "${GREEN}[✓]${NC} Database backup created: db_$TIMESTAMP.sql.gz"

# Backup uploads directory
if [ -d "$UPLOAD_DIR" ]; then
    echo ""
    echo "Backing up uploaded files..."
    tar -czf "$BACKUP_DIR/uploads_$TIMESTAMP.tar.gz" -C "$(dirname $UPLOAD_DIR)" "$(basename $UPLOAD_DIR)"
    echo -e "${GREEN}[✓]${NC} Uploads backup created: uploads_$TIMESTAMP.tar.gz"
fi

# Remove old backups
echo ""
echo "Removing backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "uploads_*.tar.gz" -mtime +$RETENTION_DAYS -delete
echo -e "${GREEN}[✓]${NC} Old backups removed"

# Show backup summary
echo ""
echo "Backup Summary:"
echo "---------------"
du -sh "$BACKUP_DIR"
ls -lh "$BACKUP_DIR" | tail -5

echo ""
echo -e "${GREEN}[✓]${NC} Backup complete! 🎉"
