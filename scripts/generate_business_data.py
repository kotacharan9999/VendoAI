import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath("."))

from database.seeds.seed_demo import seed_database


def main():
    asyncio.run(seed_database())


if __name__ == "__main__":
    main()
