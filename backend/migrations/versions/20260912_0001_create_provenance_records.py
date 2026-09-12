"""Create provenance records.

Revision ID: 20260912_0001
Revises: None
Create Date: 2026-09-12
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260912_0001"
down_revision = None
branch_labels = None
depends_on = None


def _uuid_type(bind):
    if bind.dialect.name == "postgresql":
        return postgresql.UUID(as_uuid=True)
    return sa.String(length=36)


def upgrade():
    bind = op.get_bind()
    uuid_type = _uuid_type(bind)

    op.create_table(
        "provenance_records",
        sa.Column("id", uuid_type, nullable=False),
        sa.Column("artwork_id", uuid_type, nullable=False),
        sa.Column("artisan_id", uuid_type, nullable=False),
        sa.Column("metadata_hash", sa.String(length=64), nullable=False),
        sa.Column("blockchain_network", sa.String(length=50), nullable=False),
        sa.Column("transaction_signature", sa.String(length=255), nullable=True),
        sa.Column("verification_status", sa.String(length=30), nullable=False, server_default="pending"),
        sa.Column("provider_reference", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("verified_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["artwork_id"],
            ["artworks.id"],
            name="fk_provenance_records_artwork_id_artworks",
        ),
        sa.ForeignKeyConstraint(
            ["artisan_id"],
            ["users.id"],
            name="fk_provenance_records_artisan_id_users",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_provenance_records"),
        sa.UniqueConstraint("artwork_id", name="uq_provenance_records_artwork_id"),
        sa.UniqueConstraint("transaction_signature", name="uq_provenance_records_transaction_signature"),
    )

    op.create_index("ix_provenance_records_id", "provenance_records", ["id"], unique=False)
    op.create_index("ix_provenance_records_artwork_id", "provenance_records", ["artwork_id"], unique=False)
    op.create_index("ix_provenance_records_artisan_id", "provenance_records", ["artisan_id"], unique=False)
    op.create_index("ix_provenance_records_metadata_hash", "provenance_records", ["metadata_hash"], unique=False)
    op.create_index(
        "ix_provenance_records_transaction_signature",
        "provenance_records",
        ["transaction_signature"],
        unique=False,
    )
    op.create_index(
        "ix_provenance_records_verification_status",
        "provenance_records",
        ["verification_status"],
        unique=False,
    )


def downgrade():
    op.drop_index("ix_provenance_records_verification_status", table_name="provenance_records")
    op.drop_index("ix_provenance_records_transaction_signature", table_name="provenance_records")
    op.drop_index("ix_provenance_records_metadata_hash", table_name="provenance_records")
    op.drop_index("ix_provenance_records_artisan_id", table_name="provenance_records")
    op.drop_index("ix_provenance_records_artwork_id", table_name="provenance_records")
    op.drop_index("ix_provenance_records_id", table_name="provenance_records")
    op.drop_table("provenance_records")
