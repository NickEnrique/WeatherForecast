import pandas as pd
import os

# List of cities to filter by
cities = ['melbourne', 'sydney', 'perth', 'brisbane', 'darwin', 'hobart']

# Define file paths
script_dir = os.path.dirname(os.path.abspath(__file__))  # get path of current script 
uvData = os.path.join(script_dir, 'UV Data')  # filepath for UV datasets

# Read the full dataset
df = pd.read_csv(os.path.join(script_dir, 'weatherAUS.csv'))

# Convert the 'Date' column to datetime format
df['Date'] = pd.to_datetime(df['Date'], format='%Y-%m-%d')

# Initialize a list to store DataFrames for each city
all_city_dfs = []

# Loop through each city and filter the rows where the city name matches the one in the list
for city in cities:
    # Filter the dataset based on the city name
    city_df = df[df['Location'].str.lower() == city]

    # Calculate average humidity and pressure from time-based values
    city_df['Humidity'] = round((city_df['Humidity9am'] + city_df['Humidity3pm']) / 2, 2)
    city_df['Pressure'] = round((city_df['Pressure9am'] + city_df['Pressure3pm']) / 2, 2)

    # Filter data to include only records from 2009 onwards
    city_df = city_df[city_df['Date'].dt.year >= 2009]

    # Drop unnecessary columns
    city_df = city_df.drop(columns=['Location', 'RainToday', 'RISK_MM', 'RainTomorrow',
                                     'WindGustDir', 'WindDir9am', 'WindDir3pm',
                                     'Cloud9am', 'Cloud3pm', 'WindSpeed9am', 'WindSpeed3pm',
                                     'Temp9am', 'Temp3pm',
                                     'Humidity9am', 'Humidity3pm',
                                     'Pressure9am', 'Pressure3pm'])

    # Melbourne-specific processing
    if city == 'melbourne':
        fill_data = pd.read_csv(os.path.join(script_dir, 'melb_missing_data.csv'))

        # Format 'Date' column 
        fill_data['Date'] = pd.to_datetime(fill_data['Date'])

        # Merge the missing data
        city_df = pd.merge(city_df, fill_data, on='Date', how='left', suffixes=('', '_fill'))

        # List of columns to fill
        columns_to_fill = ['MinTemp', 'MaxTemp', 'Rainfall']
        for col in columns_to_fill:
            city_df[col] = city_df[col].fillna(city_df[f'{col}_fill'])

        # Drop the []_fill columns after filling in 
        city_df = city_df.drop(columns=[f'{col}_fill' for col in columns_to_fill])

    # Merge UV dataset to current dataframe
    # Read in corresponding UV dataset 
    uv_df = pd.read_csv(os.path.join(uvData, f'uv_dataset_{city}.csv'), delimiter=';')

    # Convert 'Date' column to datetime format 
    uv_df['YYYYMMDD'] = pd.to_datetime(uv_df['YYYYMMDD'], format='%Y%m%d', errors='coerce')

    # Merge the DataFrames on the 'Date' column
    city_df = pd.merge(city_df, uv_df[['YYYYMMDD', 'UVIEF']], left_on='Date', right_on='YYYYMMDD', how='left')

    # Drop the 'YYYYMMDD' column as it's redundant after the merge
    city_df = city_df.drop(columns=['YYYYMMDD'])

    # Output each city dataframe to a CSV 
    output_file = os.path.join(script_dir, f'{city}_final.csv')
    city_df.to_csv(output_file,index=False)

    # Append the city DataFrame to the list
    all_city_dfs.append(city_df)

# Concatenate all city DataFrames into a single DataFrame
final_df = pd.concat(all_city_dfs, ignore_index=True)

# Define the output file path for the final combined DataFrame
output_file = os.path.join(script_dir, 'combined_weather_data.csv')

# Save the processed dataframe to a single CSV file
final_df.to_csv(output_file, index=False)

# Validation message
print(f'combined_weather_data.csv saved successfully.')
