#######################################################################################
#   Title: recommend_difficulty.py
#   Authors: Nadia Goralski, Stacey Koornneef
#
#   References:
#   https://surprise.readthedocs.io/en/stable/getting_started.html
#######################################################################################

import json
import pandas as pd
import re
import sys
from math import floor
from pathlib import Path
from surprise import Dataset, KNNWithZScore, Reader

survey_results = json.loads(sys.argv[1])

folder = Path("./cold-start-optimization/historic_data_sample.csv").parent.absolute()

# read data
possible_surveys = pd.read_csv(folder / 'survey_result.csv')
df = pd.read_csv(folder / "historic_data_sample.csv")

# create dataset reader with rating scale corresponding to difficulties
reader = Reader(rating_scale=(0, 4))
# load data from dataframe
data = Dataset.load_from_df(df[["survey_result_id", "errors", "adjust_level"]], reader)

# setup algo
options_dict = {"name": "cosine", "user_based": False}
knn = KNNWithZScore(sim_options=options_dict, verbose=False)

# build trainset
# NOTE: intially will just have possible survey result data
# overtime gathers user data and learns
trainset = data.build_full_trainset()
knn.fit(trainset)
survey_result_id = None

#while survey_result_id is None:
survey_results['course_code'] = 1 if re.search("^\w*\s?[3|4]\d{3}$", survey_results['course_code']) else 0


for i, row in possible_surveys.iterrows():
    if str(row['experience']) == survey_results['experience'] and \
            str(row['block_fam']) == survey_results['block_fam'] and \
            row['course_code'] == survey_results['course_code']:
        survey_result_id = int(row['id'])

previous_users = df.loc[df['survey_result_id'].astype(int) == survey_result_id]

errors = 0 if not len(previous_users.index) else previous_users['errors'].mean()
# print(errors)
prediction = knn.predict(survey_result_id, floor(errors))
for obj in [survey_result_id, round(prediction.est), prediction.est]:
    print(obj)
