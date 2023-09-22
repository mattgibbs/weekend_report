"""create off and user_off columns in downtime_data

Revision ID: 844c06a34121
Revises: 36ad32e2db26
Create Date: 2023-09-22 09:31:59.973262

"""

# revision identifiers, used by Alembic.
revision = '844c06a34121'
down_revision = '36ad32e2db26'

from alembic import op
import sqlalchemy as sa


def upgrade():
    op.add_column('downtime_data', sa.Column('user_off', sa.FLOAT, server_default="0.0"))
    op.add_column('downtime_data', sa.Column('off', sa.FLOAT, server_default="0.0"))


def downgrade():
    op.drop_column('downtime_data', 'user_off')
    op.drop_column('downtime_data', 'off')
