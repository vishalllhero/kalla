# KALAA

KALAA is India's marketplace for local art, handicrafts, and cultural creators, with digital provenance for authentic work.

## V2 architecture

```text
React / Vite / TypeScript
					|
				FastAPI
					|
 PostgreSQL (SQLite for local development)
					|
 BlockchainProvider
					|
 Solana (mock by default, devnet or production when configured)
```

The existing `artworks`, `orders`, `certificates`, and `provenance_events` models remain in place. Artisan profiles are attached to users, and the additive `provenance_records` table stores only a canonical metadata SHA-256 hash and provider reference. Private customer data, credentials, and full images are never sent to the blockchain.

## Provenance flow

1. An admin verifies the artisan and product.
2. `POST /api/v1/provenance/products/{product_id}/anchor` canonicalizes product metadata and anchors its SHA-256 hash.
3. Customers can read the record at `GET /api/v1/provenance/products/{product_id}` or verify it at `GET /api/v1/provenance/verify/{product_id}`.
4. The public UI is available at `/verify/:id`; artisan discovery is available at `/artisans`.

`BLOCKCHAIN_PROVIDER=mock` is the safe development default. It provides deterministic application behavior without signing real transactions. `BLOCKCHAIN_PROVIDER=solana` is an explicit integration boundary and currently fails closed until a server-side Solana SDK/signer is provisioned. Never put a private key in frontend code or a `VITE_*` variable.

## Local development

Install frontend dependencies with `npm install`, then run `npm run dev`. Install backend dependencies from `backend/requirements.txt` and start FastAPI with `python backend/run.py`.

Development startup uses SQLAlchemy `create_all` and will create the new additive table automatically. Production deployments should add an Alembic migration for `provenance_records` before rollout; existing production data must not be reset.

## Bootstrap an administrator

Use `backend/bootstrap_admin.py` to create the first administrator or promote an existing user. It is non-destructive: it changes only the account identified by `ADMIN_EMAIL`, and it uses the existing bcrypt password hashing implementation. It never prints the password or other secrets.

Important production-safety rules:

- Never commit credentials to the repository or to `backend/.env` or `.env.example`.
- Use `DATABASE_URL` explicitly for the target database, and verify it before running the script.
- Existing users are promoted without changing their password by default.
- Set `ADMIN_RESET_PASSWORD=true` only when you explicitly want to replace the password during promotion.
- The normal registration endpoint cannot create administrator accounts.
- Do not use `seed_data.py` for this task because it resets the development database.

From the repository root in PowerShell, create or promote an admin against a selected database:

```powershell
$env:DATABASE_URL = "postgresql://<user>:<password>@<host>:<port>/<database>"
$env:ADMIN_EMAIL = "admin@example.invalid"
$env:ADMIN_PASSWORD = "use-a-strong-password-here"
python backend/bootstrap_admin.py
```

To promote an existing user without changing their current password:

```powershell
$env:DATABASE_URL = "postgresql://<user>:<password>@<host>:<port>/<database>"
$env:ADMIN_EMAIL = "existing.user@example.com"
# do not set ADMIN_PASSWORD unless you want to reset the password
python backend/bootstrap_admin.py
```

To explicitly reset an existing user’s password during promotion:

```powershell
$env:DATABASE_URL = "postgresql://<user>:<password>@<host>:<port>/<database>"
$env:ADMIN_EMAIL = "existing.user@example.com"
$env:ADMIN_PASSWORD = "new-strong-password"
$env:ADMIN_RESET_PASSWORD = "true"
python backend/bootstrap_admin.py
```

For bash-compatible shells:

```bash
DATABASE_URL='postgresql://<user>:<password>@<host>:<port>/<database>' \
ADMIN_EMAIL='admin@example.invalid' \
ADMIN_PASSWORD='use-a-strong-password-here' \
python backend/bootstrap_admin.py
```

To target the local development database instead of a remote one, set `DATABASE_URL=sqlite:///./kalaamvp.db` explicitly in the same shell before running the command.