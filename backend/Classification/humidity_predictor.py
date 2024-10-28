# Creating a function to execute regression model for humidity

def predict_humidity(date, city, data_input):
    import pandas as pd
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import StandardScaler

    # Load data from a CSV file based on the city
    df = pd.read_csv(f'dataset/{city}_final.csv')

    # Convert Date column to datetime and drop rows with missing values
    df['Date'] = pd.to_datetime(df['Date'])
    df.dropna(inplace=True)

    # Convert Date to ordinal (numeric representation)
    df['Date_Ordinal'] = df['Date'].map(pd.Timestamp.toordinal)

    # Prepare weather-related input features
    features = ['Date_Ordinal', 'MinTemp', 'MaxTemp', 'Pressure', 'UVIEF']

    # Separate features and target for Humidity prediction
    X_humidity = df[features]
    y_humidity = df['Humidity']

    # Split data into train and test sets
    X_train_humidity, X_test_humidity, y_train_humidity, y_test_humidity = train_test_split(X_humidity, y_humidity, test_size=0.2, random_state=42)

    # Standardize the features
    scaler_humidity = StandardScaler()
    X_train_humidity_scaled = scaler_humidity.fit_transform(X_train_humidity)

    # Train Random Forest model for Humidity
    humidity_model = RandomForestRegressor(n_estimators=91, random_state=42)
    humidity_model.fit(X_train_humidity_scaled, y_train_humidity)

    # Prepare user input for prediction
    date = pd.to_datetime(date)
    data_input['Date_Ordinal'] = date.toordinal()

    # Convert user input into DataFrame
    input_df = pd.DataFrame([data_input])

    # Scale the input data
    input_humidity_scaled = scaler_humidity.transform(input_df[features])

    # Make prediction
    predicted_humidity = humidity_model.predict(input_humidity_scaled)[0]

    return predicted_humidity