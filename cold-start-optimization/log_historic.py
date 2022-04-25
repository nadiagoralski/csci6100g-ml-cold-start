#######################################################################################
#   Title: log_historic.py
#   Authors: Nadia Goralski, Stacey Koornneef
#
#   Log data from front end to CSV
#
#######################################################################################


import pandas as pd
import sys
from pathlib import Path


def adjust_level(level, error_count):
    if error_count > 2 and level > 0:
        return level - 1
    return level


survey_result_id = int(sys.argv[1])
difficulty = int(sys.argv[2])
errors = int(sys.argv[3])
rec_level = adjust_level(difficulty, errors)

folder = Path("./cold-start-optimization/historic_data_sample.csv").parent.absolute()
df = pd.read_csv(folder / "historic_data_sample.csv", index_col='id')

# new_data = pd.DataFrame({'':[int(df.)]
#                          'survey_result_id': [],
#                          'init_level': [difficulty],
#                          'errors': [errors],
#                          'adjust_level': [adjust_level(difficulty, errors)]})

# insert: survey_result_id,init_level,errors,adjust_level
df.loc[df.shape[0]] = [survey_result_id, difficulty, errors, rec_level]

df.to_csv(folder / "historic_data_sample.csv")

print("done")