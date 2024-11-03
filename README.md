# WeatherForecast
Weather Forecast Web Application using React.js, FastAPI, and Python Scikit-Learn (COS30049 - Computing Technology Innovation Project) 

## Installing Dependencies
As mentioned, this web application is created using React.js, FastAPI and Python. Therefore, all the dependencies needs to be installed first
To do this, run the following commands to ensure that the Python dependencies are installed:

pip install fastapi uvicorn scikit-learn

Some additional dependencies include:
1. Pandas
2. Numpy
3. Joblib
4. OS
5. Pydantic

Should there be any error regarding dependencies yet to be installed, please install the dependencies as needed using the following command:

pip install *library/dependency_name*

For the front-end side of dependencies, change the location header to the frontend folder by using the "cd frontend" command
Then execute the following command to install all required dependencies:

npm i

This will install some of the following main dependencies:
1. D3
2. React
3. MUI

Upon any errors of uninstalled dependencies, please install the needed libraries by using the following command:

npm install *library/dependency_name*


## Running the Back-End Server
To run the python app and the back-end server through uvicorn, change the location header to the backend folder

cd backend

Following that, start the uvicorn server by running the following command:

uvicorn api:app --reload

This will start the local server in port 8000 and start to train the Machine Learning Models
Note: The training might take a while depending on the processing capacity of the device

A step by step training logging has been added to check if the training has been completed or not. 
The trained model will be saved locally in the 'models' folder to ensure that retraining is not needed when stopping and running the uvicorn server again.


## Running the Front-End Web App
Once all the dependencies has been installed and the backend server is running, change the location header to the frontend folder

cd frontend

Then run the React app by using the following command:

npm start

The server should automatically start and open a new tab in the default browser of the device. If not, please click on the link that is displayed in the console to head to the web application.