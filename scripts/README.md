# Scripts

This folder contains developer utility scripts for the dron-alert project.

## Export to SQL

**File:** `export-to-sql.js`

Exports the entire database to a SQL dump file using Prisma Client. Useful for backups or migrating data.

### Usage

```bash
node scripts/export-to-sql.js
```

This will create `scripts/dump.sql` containing:
- Table structure (CREATE statements)
- All data from User and Incident tables (INSERT statements)

### Note

The `dump.sql` file is gitignored to avoid committing sensitive data.
