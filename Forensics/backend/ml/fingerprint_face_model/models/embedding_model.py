import torch
import torch.nn as nn
import torchvision.models as models


class EmbeddingNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.base = models.resnet18(weights=None)
        self.base.fc = nn.Linear(self.base.fc.in_features, 128)

    def forward(self, x):
        x = self.base(x)
        x = nn.functional.normalize(x, p=2, dim=1)
        return x
