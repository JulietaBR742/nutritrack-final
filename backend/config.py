import os

import pyodbc


def get_connection():
    connection_string = (
        f"DRIVER={{{os.getenv('DB_DRIVER', 'MariaDB ODBC 3.1 Driver')}}};"
        f"SERVER={os.getenv('DB_HOST', 'db-server')};"
        f"PORT={os.getenv('DB_PORT', '3306')};"
        f"DATABASE={os.getenv('DB_NAME', 'nutritrack')};"
        f"UID={os.getenv('DB_USER', 'root')};"
        f"PWD={os.getenv('DB_PASSWORD', 'rootpassword')};"
        "OPTION=3;"
        "CHARSET=UTF8MB4;"
    )
    return pyodbc.connect(connection_string)
