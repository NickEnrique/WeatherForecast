# Creating a function to execute isolation forest model

def detect_anomaly(weather_data, city):
    import pandas as pd
    from sklearn.ensemble import IsolationForest
    from sklearn.preprocessing import StandardScaler

    # Load data from a CSV file based on the city
    df = pd.read_csv(f'dataset/{city}_final.csv')

    # Convert Date column to datetime type 
    df['Date'] = pd.to_datetime(df['Date'])

    # Filling in missing data and dropping columns as necessary
    if city == 'sydney': 
        # Drop rows for Sydney from 2009 to 2010
        # Due to a significant amount of data missing for WindGustSpeed
        df = df[(df['Date'].dt.year < 2009) | (df['Date'].dt.year > 2010)]
    elif city == 'melbourne':
        # Drop rows for Melbourne for the year 2015
        # Due to significant amount of data missing for Humidity and Pressure
        df = df[df['Date'].dt.year != 2015]

    df = df.interpolate(method='linear') # Use linear interpolation to fill in data

    # Check for remaining NaN values after interpolation
    if df.isnull().values.any():
        df.fillna(df.median(), inplace=True)  # Fill remaining missing values with median imputation

    # Features to use for anomaly detection
    features = ['MinTemp', 'MaxTemp', 'Humidity', 'WindGustSpeed', 'Pressure', 'UVIEF']

    # Prepare the input data for model training
    X = df[features]
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Train the Isolation Forest model
    model = IsolationForest(contamination=0.05, random_state=42, n_estimators=200, max_samples=0.9)
    model.fit(X_scaled)

    # Convert new input into DataFrame and scale it
    new_input_df = pd.DataFrame([weather_data], columns=features)
    new_input_scaled = scaler.transform(new_input_df)

    # Predict anomaly score and label for the new input
    anomaly_score = model.decision_function(new_input_scaled)[0]
    anomaly_label = model.predict(new_input_scaled)[0]

    # Return output the results from input
    return {
        'anomaly_label': anomaly_label,
        'anomaly_score': anomaly_score
    }