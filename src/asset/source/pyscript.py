import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime



x = np.random.randn(1000)
y = np.random.randn(1000)

fig, ax = plt.subplots()
ax.scatter(x, y)


now = datetime.now()
now.strftime("%m/%d/%Y, %H:%M:%S")

print("Dzien dobry")



