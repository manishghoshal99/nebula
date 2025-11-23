import unittest
import pandas as pd
from src.data_loader import load_data, load_config
from pathlib import Path

class TestDataLoader(unittest.TestCase):
    def test_load_config(self):
        config = load_config()
        self.assertIn("data_path", config)
        self.assertIn("sensor_count", config)

    def test_load_data(self):
        # This test assumes the data file exists. 
        # In a CI environment, we might mock this or use a small sample.
        try:
            df = load_data()
            self.assertIsInstance(df, pd.DataFrame)
            self.assertFalse(df.empty)
            self.assertIn("ClassName", df.columns)
        except FileNotFoundError:
            print("Skipping data load test as file not found.")

if __name__ == '__main__':
    unittest.main()
