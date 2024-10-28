import os 
import pandas as pd
# Model Implementation
from sklearn.ensemble import RandomForestRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
# Model Evaluation
from sklearn.metrics import root_mean_squared_error, r2_score, mean_absolute_error
# Visualisation
import matplotlib.pyplot as plt
import seaborn as sns


script_dir = os.path.dirname(os.path.abspath(__file__))

# Function to predict temperature based on specified model and dataset
def Predict(model_name, filename):
    df = pd.read_csv(os.path.join(script_dir, filename))

    # Convert Date column to datetime
    df['Date'] = pd.to_datetime(df['Date'])

    # Fill in missing data
    df = df.interpolate(method='linear')
    
    # generate correlation matrix to consider what features to use
    matrix = df.corr()
    plt.figure(figsize=(8, 6))  # Set the size of the plot
    sns.heatmap(matrix, annot=True, cmap='coolwarm', vmin=-1, vmax=1)

    # Define input features and target variables
    X = df[['Rainfall', 'WindGustSpeed', 'Humidity', 'Pressure', 'UVIEF','Sunshine','Evaporation']]
    y = df[['MinTemp', 'MaxTemp']]

    # Choose the model
    if model_name == 'Random Forest':
        model = MultiOutputRegressor(RandomForestRegressor(n_estimators=200, random_state=42))
    elif model_name == 'Linear Regression':
        model = MultiOutputRegressor(LinearRegression())

    # Split the data into training and test sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42)  # 80% training, 20% testing
    
    # Standardizing values for better performance
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)  
    X_test_scaled = scaler.transform(X_test)       

    model.fit(X_train_scaled, y_train)
    y_pred = model.predict(X_test_scaled)

    # Calculate evaluation metrics
    r2 = r2_score(y_test, y_pred, multioutput='raw_values')
    mae = mean_absolute_error(y_test, y_pred, multioutput='raw_values')
    rmse = root_mean_squared_error(y_test, y_pred, multioutput='raw_values')  

    # Display results in columns and rows format
    # Create the header and rows
    headers = ['Metric', 'MinTemp', 'MaxTemp']
    data = [
        ['R²', r2[0], r2[1]],
        ['Mean Absolute Error (MAE)', mae[0], mae[1]],
        ['Root Mean Squared Error (RMSE)', rmse[0], rmse[1]]
    ]
    
    print(f'Evaluation Metrics for {model_name} using {filename}:')
    # Print column headers
    print(f"{headers[0]:<30} {headers[1]:<10} {headers[2]:<10}")

    # Print each row of data
    for row in data:
        print(f"{row[0]:<30} {row[1]:<10.4f} {row[2]:<10.4f}")
    print('\n')

    return df, y_test, y_pred, X_test # Use these variables to plot graph

# Get results only for Random Forest
df, y_test, y_pred, X_test = Predict('Random Forest', 'combined_weather_data.csv')
Predict('Linear Regression','combined_weather_data.csv')
Predict('Random Forest', 'hobart_final.csv')

# Convert predictions and actual values to DataFrame for easier plotting
y_test_df = pd.DataFrame(y_test, columns=['MinTemp', 'MaxTemp'])
y_pred_df = pd.DataFrame(y_pred, columns=['predictedMin', 'predictedMax'])

dates = df.loc[X_test.index, 'Date']  # Get the corresponding Date for test data

# Scatter plot for MinTemp against Date
plt.figure(figsize=(12, 6))
plt.scatter(dates, y_test_df['MinTemp'], color='blue', label='Actual', alpha=0.7)
plt.scatter(dates, y_pred_df['predictedMin'], color='red', label='Predicted', alpha=0.7)
plt.title('Actual vs Predicted Minimum Temperature')
plt.xlabel('Date')
plt.ylabel('Temperature (°C)')
plt.legend(loc='upper right')
plt.grid(True)
plt.xticks(rotation=45)
plt.show()

# Scatter plot for MaxTemp against Date
plt.figure(figsize=(12, 6))
plt.scatter(dates, y_test_df['MaxTemp'], color='green', label='Actual', alpha=0.7)
plt.scatter(dates, y_pred_df['predictedMax'], color='orange', label='Predicted', alpha=0.7)
plt.title('Actual vs Predicted Maximum Temperature')
plt.xlabel('Date')
plt.ylabel('Temperature (°C)')
plt.legend(loc='upper right')
plt.grid(True)
plt.xticks(rotation=45)
plt.show()

