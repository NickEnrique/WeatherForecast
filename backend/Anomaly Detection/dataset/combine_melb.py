import pandas as pd
import os

script_dir = os.path.dirname(os.path.abspath(__file__)) 

# Function to create a Date column from Year, Month, and Day
def create_date_column(df):
    df['Date'] = pd.to_datetime(df[['Year', 'Month', 'Day']])
    return df

# Load each CSV file
mintemp_df = pd.read_csv(os.path.join(script_dir,'mintemp.csv'))
maxtemp_df = pd.read_csv(os.path.join(script_dir,'maxtemp.csv'))
rainfall_df = pd.read_csv(os.path.join(script_dir,'rainfall.csv'))

# Process each DataFrame to create the Date column
mintemp_df = create_date_column(mintemp_df)
maxtemp_df = create_date_column(maxtemp_df)
rainfall_df = create_date_column(rainfall_df)

#only 2015 - 2016 needed so filter from 2015 onwards 
mintemp_df = mintemp_df[mintemp_df['Date'] >= '2015-01-01']
maxtemp_df = maxtemp_df[maxtemp_df['Date'] >= '2015-01-01']
rainfall_df = rainfall_df[rainfall_df['Date'] >= '2015-01-01']

# Select only relevant columns to merge 
mintemp_df = mintemp_df[['Date', mintemp_df.columns[5]]].rename(columns={mintemp_df.columns[5]: 'MinTemp'})
maxtemp_df = maxtemp_df[['Date', maxtemp_df.columns[5]]].rename(columns={maxtemp_df.columns[5]: 'MaxTemp'})
rainfall_df = rainfall_df[['Date', rainfall_df.columns[5]]].rename(columns={rainfall_df.columns[5]: 'Rainfall'})


# Merge the DataFrames on Date
merged_df = mintemp_df.merge(maxtemp_df, on='Date').merge(rainfall_df, on='Date')

# Save the final DataFrame to a CSV
merged_df.to_csv(os.path.join(script_dir,'melb_missing_data.csv'), index=False)

print("Merged data saved to 'melb_missing_data.csv'")
