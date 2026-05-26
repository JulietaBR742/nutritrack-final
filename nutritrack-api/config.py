# config.py
import pyodbc
print(pyodbc.drivers())

def get_connection():
    conn = pyodbc.connect(
        'DRIVER={MariaDB ODBC 3.2 Driver};'
        'SERVER=localhost;'
        'PORT=3306;'
        'DATABASE=nutritrack_v2;'
        'USER=root;'
        'PASSWORD=;'
        'OPTION=3;'
        'CHARSET=UTF8MB4;'
    )
    return conn
