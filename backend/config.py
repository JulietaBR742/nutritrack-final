import os

import pyodbc


def resolve_driver():
    configured_driver = os.getenv("DB_DRIVER")
    installed_drivers = pyodbc.drivers()

    if configured_driver and configured_driver in installed_drivers:
        return configured_driver

    for driver_name in installed_drivers:
        if "MariaDB" in driver_name:
            return driver_name

    if configured_driver:
        return configured_driver

    raise RuntimeError(f"No MariaDB ODBC driver found. Installed drivers: {installed_drivers}")


def get_connection():
    driver_name = resolve_driver()
    connection_string = (
        f"DRIVER={{{driver_name}}};"
        f"SERVER={os.getenv('DB_HOST', 'db-server')};"
        f"PORT={os.getenv('DB_PORT', '3306')};"
        f"DATABASE={os.getenv('DB_NAME', 'nutritrack')};"
        f"UID={os.getenv('DB_USER', 'root')};"
        f"PWD={os.getenv('DB_PASSWORD', 'rootpassword')};"
        "OPTION=3;"
        "CHARSET=UTF8MB4;"
    )
    return pyodbc.connect(connection_string)
