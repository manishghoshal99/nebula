import unittest
import torch
from src.models.dl_models import MLP, DANN

class TestDLModels(unittest.TestCase):
    def test_mlp_forward(self):
        input_dim = 128
        num_classes = 6
        model = MLP(input_dim, num_classes)
        x = torch.randn(10, input_dim)
        logits = model(x)
        self.assertEqual(logits.shape, (10, num_classes))

    def test_dann_forward(self):
        input_dim = 128
        num_classes = 6
        model = DANN(input_dim, num_classes)
        x = torch.randn(10, input_dim)
        class_logits, domain_logits, features = model(x)
        self.assertEqual(class_logits.shape, (10, num_classes))
        self.assertEqual(domain_logits.shape, (10, 1))
        self.assertEqual(features.shape, (10, 64)) # default hidden dim

if __name__ == '__main__':
    unittest.main()
