import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath("."))

from database.seeds.seed_data import seed_database
from scripts.seed_rayalaseema_ap import seed_rayalaseema_ap_data


async def run_all_seeds():
    await seed_database()
    await seed_rayalaseema_ap_data()


def main():
    asyncio.run(run_all_seeds())


if __name__ == "__main__":
    main()
