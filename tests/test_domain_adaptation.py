import unittest
import torch
from src.domain_adaptation import coral_loss, grad_reverse

class TestDomainAdaptation(unittest.TestCase):
    def test_coral_loss(self):
        source = torch.randn(10, 32)
        target = torch.randn(10, 32)
        loss = coral_loss(source, target)
        self.assertIsInstance(loss, torch.Tensor)
        self.assertTrue(loss.item() >= 0)

    def test_grad_reverse(self):
        x = torch.randn(10, 32, requires_grad=True)
        y = grad_reverse(x, alpha=0.5)
        loss = y.sum()
        loss.backward()
        # Gradient should be reversed and scaled by alpha
        self.assertTrue(torch.allclose(x.grad, torch.ones_like(x) * -0.5))

if __name__ == '__main__':
    unittest.main()
