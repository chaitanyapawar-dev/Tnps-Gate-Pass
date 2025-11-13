# DB schema import instructions

This folder contains SQL dumps from the original application and a consolidated schema file `combined_schema.sql` you can run in MySQL Workbench.

Quick steps to import in MySQL Workbench:

1. Open MySQL Workbench and connect to your MySQL server.
2. From the menu choose `File -> Open SQL Script` and open `DB/combined_schema.sql`.
3. Review and, if desired, change the `CREATE DATABASE` name at the top (default: `gatepass_db`).
4. Run the script to create the database and tables.

Notes and assumptions:

- The source SQL dumps used many `VARCHAR` columns for date/time values (e.g. `indatetime`, `outdatetime`). Consider converting these to `DATETIME` or `TIMESTAMP` after import for proper date operations.
- Two student tables exist: `studentdetails` and `studentdetails2`. Both were preserved as separate tables.
- No foreign key constraints were present in the original dumps; I did not invent relationships. If you want FK constraints, I can suggest appropriate ones based on code references.
- If you want seed data restored, provide the data exports or I can extract INSERTs from the original dumps if present.

If you'd like, I can:

- Convert date-like `VARCHAR` columns to `DATETIME` and update the application code examples.
- Add foreign key constraints inferred from code usage.
- Extract any `INSERT` statements and produce a data import script.
