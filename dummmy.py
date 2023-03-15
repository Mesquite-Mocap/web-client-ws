#read acce.txt from siva_sm21_0

import os
import sys
import numpy as np


for i in range(0, 7):
    data_root = os.path.join(os.path.dirname(__file__), 'siva_sm31_' + str(i))

    file = np.genfromtxt(data_root + '/acce.txt')
    print(file.shape)
    file[:,1:]  = (file[:,1:]*(9.81))


    np.savetxt(data_root + '/acce.txt', file ,fmt="%.3f", delimiter=' ')