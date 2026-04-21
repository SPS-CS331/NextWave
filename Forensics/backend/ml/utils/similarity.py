import numpy as np
from numpy.linalg import norm


def cosine_similarity(a, b):
    denominator = norm(a) * norm(b)
    if denominator == 0:
        return 0.0
    return float(np.dot(a, b) / denominator)
