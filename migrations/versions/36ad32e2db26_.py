"""empty message

Revision ID: 36ad32e2db26
Revises: 446ee9091244
Create Date: 2016-08-06 21:59:43.820295

"""

# revision identifiers, used by Alembic.
revision = '36ad32e2db26'
down_revision = '446ee9091244'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('downtime_data', sa.Column('tuning', sa.Float(), nullable=True))
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('downtime_data', 'tuning')
    ### end Alembic commands ###
