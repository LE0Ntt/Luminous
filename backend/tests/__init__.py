"""
Backend tests, run from the backend folder: python -m unittest discover -s tests -t .

Runs before the test modules are imported: the server works on a temporary copy of the
database and with a fake OLA client, so neither the real database nor DMX output is touched.
"""

import atexit
import os
import shutil
import tempfile

from tests.fakes import install_fake_ola

_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_TEMP_DIR = tempfile.mkdtemp(prefix="luminous-tests-")
atexit.register(shutil.rmtree, _TEMP_DIR, ignore_errors=True)

TEST_DATABASE = os.path.join(_TEMP_DIR, "database.db")
shutil.copy(os.path.join(_BACKEND_DIR, "server", "database.db"), TEST_DATABASE)
os.environ["DATABASE_URL"] = "sqlite:///" + TEST_DATABASE

install_fake_ola()
