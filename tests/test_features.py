import unittest
import pandas as pd
from src.features import get_feature_cols, get_sensor_block_cols, col_to_sensor_and_feature

class TestFeatures(unittest.TestCase):
    def setUp(self):
        # Create dummy dataframe with V1..V128
        cols = [f"V{i}" for i in range(1, 129)]
        self.df = pd.DataFrame(columns=cols)
        self.feature_cols = cols

    def test_get_feature_cols(self):
        cols = get_feature_cols(self.df)
        self.assertEqual(len(cols), 128)
        self.assertEqual(cols[0], "V1")

    def test_get_sensor_block_cols(self):
        # Sensor 1 should be V1..V8
        s1_cols = get_sensor_block_cols(1, self.feature_cols)
        self.assertEqual(len(s1_cols), 8)
        self.assertEqual(s1_cols[0], "V1")
        self.assertEqual(s1_cols[-1], "V8")

        # Sensor 2 should be V9..V16
        s2_cols = get_sensor_block_cols(2, self.feature_cols)
        self.assertEqual(len(s2_cols), 8)
        self.assertEqual(s2_cols[0], "V9")

    def test_col_to_sensor_and_feature(self):
        s, f = col_to_sensor_and_feature("V1", self.feature_cols)
        self.assertEqual(s, 1)
        self.assertEqual(f, "DeltaR")

        s, f = col_to_sensor_and_feature("V9", self.feature_cols)
        self.assertEqual(s, 2)
        self.assertEqual(f, "DeltaR")

if __name__ == '__main__':
    unittest.main()
