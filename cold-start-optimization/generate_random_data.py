import pandas as pd
import random
import math

# experience, familiarity, upper level course
x = [
    [0.0, 0.0, 0.0], [0, 0, 1], [0, 1, 0], [0, 1, 1],
    [1, 0, 0], [1, 0, 1], [1, 1, 0], [1, 1, 1],
    [2, 0, 0], [2, 0, 1], [2, 1, 0], [2, 1, 1],
    [3, 0, 0], [3, 0, 1], [3, 1, 0], [3, 1, 1],

]


# expected output as a level
levels = [
    0, 1, 1, 2,
    1, 2, 2, 2,
    3, 3, 3, 3,
    3, 3, 4, 4
]


df = pd.read_csv('historic_data_sample.csv', index_col='id')

for r, row in df.iterrows():
    if math.isnan(row['init_level']):
        vals =row[['experience','block_fam','course_code']].to_numpy().tolist()
        vals = [ int(x) for x in vals ]
        #print(vals)
        i = x.index(vals)
        level = levels[i]
        df.at[r, 'init_level'] = level
        errors = random.randint(0, 5)
        actual_level = level
        if (errors > 2 and level > 1):
            actual_level-=1


        df.at[r, 'errors'] = errors
        df.at[r, 'adjust_level'] = actual_level
    else:
        print("skipping row ", r)


df.to_csv('./historic_data_sample.csv')
