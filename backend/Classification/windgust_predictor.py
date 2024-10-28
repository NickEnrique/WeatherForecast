# Creating a function to execute regression model for windgust speed

def predict_windgust(date, city, data_input, humidity):
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

    # Prepare weather-related input features (excluding Humidity)
    features = ['Date_Ordinal', 'MinTemp', 'MaxTemp', 'Pressure', 'UVIEF']

    # Separate features and target for Wind Gust Speed prediction
    X_windgust = df[features + ['Humidity']]
    y_windgust = df['WindGustSpeed']

    # Split data into train and test sets
    X_train_windgust, X_test_windgust, y_train_windgust, y_test_windgust = train_test_split(X_windgust, y_windgust, test_size=0.2, random_state=42)

    # Standardize the features
    scaler_windgust = StandardScaler()
    X_train_windgust_scaled = scaler_windgust.fit_transform(X_train_windgust)

    # Train Random Forest model for Wind Gust Speed
    windgust_model = RandomForestRegressor(n_estimators=105, random_state=42)
    windgust_model.fit(X_train_windgust_scaled, y_train_windgust)

    # Prepare user input for prediction
    date = pd.to_datetime(date)
    data_input['Date_Ordinal'] = date.toordinal()
    
    # Add humidity as a separate value to user input
    data_input['Humidity'] = humidity

    # Convert user input into DataFrame
    input_df = pd.DataFrame([data_input])

    # Scale the input data
    input_windgust_scaled = scaler_windgust.transform(input_df[features + ['Humidity']])

    # Make prediction
    predicted_windgust = windgust_model.predict(input_windgust_scaled)[0]

    return predicted_windgust