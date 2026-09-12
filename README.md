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