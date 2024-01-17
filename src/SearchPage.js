// SearchPage.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './SearchPage.css'; // Import the CSS file

const SearchPage = () => {
    const [centerLocations, setCenterLocations] = useState([]);
    const [specializations, setSpecializations] = useState([]);
    const [selectedCenter, setSelectedCenter] = useState('');
    const [selectedSpecialization, setSelectedSpecialization] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [noRecordsFound, setNoRecordsFound] = useState(false);
    const apiHost = process.env.REACT_APP_API_URL;
    const apiKey = process.env.REACT_APP_API_KEY;
    useEffect(() => {
        // Make a REST call to your Golang backend service to fetch center locations
        fetch(`${apiHost}/center-locations`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
          }
        })
          .then((response) => response.json())
          .then((data) => {
            // Set the retrieved center locations in state
            setCenterLocations(data);
          })
          .catch((error) => {
            console.error('Error fetching center locations:', error);
          });

          // Make a REST call to your Golang backend service to fetch specializations
        fetch(`${apiHost}/specializations`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
          }
        })
        .then((response) => response.json())
        .then((data) => {
        // Set the retrieved specializations in state
        setSpecializations(data);
        })
        .catch((error) => {
        console.error('Error fetching specializations:', error);
        });
      }, [apiHost, apiKey]); // Empty dependency array ensures the effect runs only once on component mount

      const handleSearch = () => {
        // Make a REST call to your Golang backend service to search for doctors
        fetch(`${apiHost}/doctors?center_id=${selectedCenter}&specialization_id=${selectedSpecialization}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
          }
        })
          .then((response) => response.json())
          .then((data) => {
            // Set the retrieved doctors in state
            setDoctors(data);
            // Set noRecordsFound to true if no records are found
            setNoRecordsFound(data.length === 0);
          })
          .catch((error) => {
            console.error('Error fetching doctors:', error);
            // Set noRecordsFound to true in case of an error
            setNoRecordsFound(true);
          });
      };      

  return (
    <div className="search-page-container">
      <h2>Search Healthcare Centers and Doctors</h2>

      {/* Healthcare Center Selection */}
      <div className="form-group">
        <label>Select Healthcare Center:</label>
        <select value={selectedCenter} onChange={(e) => setSelectedCenter(e.target.value)}>
          <option value="">All</option>
          {centerLocations.map((center) => (
            <option key={center.center_id} value={center.center_id}>
              {center.center_name}
            </option>
          ))}
        </select>
      </div>

      {/* Doctor Search */}
      <div className="form-group">
        <label>Select Specialization:</label>
        <select value={selectedSpecialization} onChange={(e) => setSelectedSpecialization(e.target.value)}>
          <option value="">All</option>
          {specializations.map((specialization) => (
            <option key={specialization.specialization_id} value={specialization.specialization_id}>
              {specialization.specialization_name}
            </option>
          ))}
        </select>
      </div>

      {/* Search Button */}
      <button type="button" onClick={handleSearch}>
        Search
      </button>

      {/* Display Doctors or No Records Found Message */}
      <h3>Doctors List</h3>
      {noRecordsFound ? (
        <p>No records found</p>
      ) : (
        <div className="doctor-list">          
          <ul>
            {doctors.map((doctor) => (
               <li key={doctor.doctor_id}>
                <Link to={{
                  pathname: `/doctor-details/${doctor.doctor_id}`,
                  state: { doctorDetails: doctor }, // Pass doctor details as state
                }}
              >
                 {doctor.first_name} {doctor.last_name}</Link>
               </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
