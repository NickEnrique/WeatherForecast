import os
import pandas as pd

# Get the directory of the current script
script_dir = os.path.dirname(os.path.abspath(__file__)) 
cities = ['melbourne', 'sydney', 'perth', 'brisbane', 'darwin', 'hobart']

for city in cities:
    # Construct the file path
    file_path = os.path.join(script_dir, f'{city}_final.csv')
    df = pd.read_csv(file_path)

    # Convert 'Date' column to datetime type, handling errors
    df['Date'] = pd.to_datetime(df['Date'], errors='coerce')

    # Extract the year from the 'Date' column
    df['Year'] = df['Date'].dt.year

    # Calculate the sum of missing per column, and group it by year
    missing_counts = df.groupby('Year').agg(lambda x: x.isnull().sum()).reset_index() 

    # Rename the columns for better readability
    missing_counts.columns = ['Year'] + list(missing_counts.columns[1:])

    # Display the missing values per year
    print(f'{city.capitalize()} missing values:')
    print(missing_counts)

    # Create a summary of missing values per year
    missing_summary = missing_counts.set_index('Year').sum(axis=1)

    # Identify the year with the most missing values
    most_missing_year = missing_summary.idxmax()
    most_missing_count = missing_summary.max()
    print(f"Year with most missing values: {most_missing_year} ({most_missing_count} missing values) \n")

    # Filter rows with missing values
    missing_rows = df[df.isnull().any(axis=1)]

    # Apply exclusion criteria
    if city.lower() == 'sydney' and (2009 <= missing_rows['Year'].max() <= 2010):
        print(f"Excluding missing rows for {city.capitalize()} in 2009 and 2010.") 
    elif city.lower() == 'melbourne' and missing_rows['Year'].eq(2015).any():
        print(f"Excluding missing rows for {city.capitalize()} in 2015.")
    else:
        # Save rows with missing values to a CSV file for further inspection
        output_file_path = os.path.join(script_dir, f'{city}_missing_values.csv')
        missing_rows.to_csv(output_file_path, index=False)
        print(f'Saved missing rows for {city.capitalize()} to {output_file_path}')
