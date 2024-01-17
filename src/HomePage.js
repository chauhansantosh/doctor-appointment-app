// HomePage.js
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken} from 'firebase/messaging';
import './HomePage.css'; // Import the CSS file

const firebaseConfig = JSON.parse(atob(process.env.REACT_APP_FIREBASE_CONFIG));
initializeApp(firebaseConfig);

const messaging = getMessaging();

const HomePage = () => {
  const [employeeCode, setEmployeeCode] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // New state for error message
  const history = useHistory();
  const { login, setUserDeviceToken } = useAuth();
  

 const apiHost = process.env.REACT_APP_API_URL;
 const apiKey = process.env.REACT_APP_API_KEY;
 const myVapidKey = process.env.REACT_APP_VAPIDKEY
 
  const handleLogin = () => {
    // Make a REST call to your Golang backend service for authentication
    fetch(`${apiHost}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        username: employeeCode,
        password: password
      })
    })
      .then((response) => {
        console.log("response: ", response)
        if (!response.ok) {
           throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
     })
      .then((data) => {
        // Check the authentication response from the server
        if (data.success) {
            // After successful login, set patient_id in context and redirect to the search page
            console.log('login successful', data.patient_id)
            login(data.patient_id);
            history.push('/search');

           // Request permission for notifications when the login is successful
            Notification.requestPermission()
            .then((permission) => {
                if (permission === 'granted') {
                    // Get the registration token
                    return getDeviceToken();
                } else {
                    console.error('Notification permission denied');
                    return null;
                }
            })
            .then((token) => {
                if (token) {
                    console.log('FCM Token:', token);
                    setUserDeviceToken(token);
                    // Send the FCM token to your server to update the patient table
                    updateDeviceToken(data.patient_id, token);
                }
            })
            .catch((error) => {
                console.error('Error requesting notification permission:', error);
            });

          } else {
            // Authentication failed, set error message
            setErrorMessage(data.message);
          }
      })
      .catch((error) => {
        console.error('Error during authentication:', error);
        setErrorMessage('An error occurred during authentication.');
      });
  };

  
  function getDeviceToken() {
    // Get registration token. Initially, this makes a network call. Once retrieved,
    // subsequent calls to getToken will return from cache.
    return getToken(messaging, { vapidKey: myVapidKey})
        .then((currentToken) => {
            if (currentToken) {
                return currentToken;
            } else {
                console.log('No registration token available. Request permission to generate one.');
                return null;
            }
        })
        .catch((err) => {
            console.log('An error occurred while retrieving token. ', err);
            return null;
        });
}

  // Function to update the device token in the patient table
  const updateDeviceToken = (patientId, token) => {
    fetch(`${apiHost}/update-patient?patient_id=`+patientId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        device_token: token
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log('Device token updated successfully');
        } else {
          console.error('Error updating device token:', data.message);
        }
      })
      .catch((error) => {
        console.error('Error updating device token:', error);
      });
  };

  return (
    <div className="home-page-container">
      <div className="left-section">
        <h1>Welcome to HCL Healthcare</h1>
        {/* Generic Information */}
        <p>
          HCL Healthcare is your dedicated partner in well-being. Our patient-centric approach and state-of-the-art
          facilities ensure that you receive the highest standard of medical care. Explore our services and embark on
          a journey to better health.
        </p>
        {/* Additional Generic Information */}
        <p>
          At HCL Healthcare, we are committed to providing comprehensive healthcare services that prioritize your
          health and well-being. Our experienced healthcare professionals, cutting-edge technology, and patient-focused
          approach make us a trusted choice for your medical needs.
        </p>
      </div>

      <div className="right-section">
        {/* Login Feature */}
        <form>
          <input
            type="text"
            placeholder="Employee Code"
            value={employeeCode}
            onChange={(e) => setEmployeeCode(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="button" onClick={handleLogin}>
            Login
          </button>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
        </form>
      </div>
    </div>
  );
};

export default HomePage;
