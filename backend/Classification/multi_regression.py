# Creating a function to execute multioutput regression model

def regression_date_predict(date, city):
    import pandas as pd
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.multioutput import MultiOutputRegressor
    from sklearn.model_selection import train_test_split


    # Load data from a CSV file based on the city
    df = pd.read_csv(f'dataset/{city}_final.csv')
    df = df.dropna(subset=['MinTemp', 'MaxTemp', 'Rainfall', 'Pressure', 'UVIEF'])

    # Convert Date column to datetime
    df['Date'] = pd.to_datetime(df['Date'])

    # Extract date-related features
    df['Year'] = df['Date'].dt.year
    df['Month'] = df['Date'].dt.month
    df['Day'] = df['Date'].dt.day
    df['DayOfYear'] = df['Date'].dt.dayofyear

    # Remove original Date column
    df.drop('Date', axis=1, inplace=True)

    # Define input features and target variables
    X = df[['Year', 'Month', 'Day', 'DayOfYear']]
    y = df[['MinTemp', 'MaxTemp', 'Pressure', 'UVIEF']]

    # Split the data into training and test sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Initialize and fit the model
    regr = MultiOutputRegressor(RandomForestRegressor(n_estimators=325, random_state=42))
    regr.fit(X_train, y_train)

    # Extracting date-related features from the input
    date = pd.to_datetime(date)
    year, month, day, day_of_year = date.year, date.month, date.day, date.dayofyear

    # Using the input data to generate forecast data from the model
    input_data = pd.DataFrame([[year, month, day, day_of_year]], columns=['Year', 'Month', 'Day', 'DayOfYear'])
    
    # Make prediction using regression model
    prediction = regr.predict(input_data)

    # Return the prediction
    return {
        'Date': date,
        'MinTemp': prediction[0][0],
        'MaxTemp': prediction[0][1],
        'Pressure': prediction[0][2],
        'UVIEF': prediction[0][3]
    }