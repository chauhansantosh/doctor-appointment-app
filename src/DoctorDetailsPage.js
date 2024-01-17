// DoctorDetailsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getMessaging, onMessage } from "firebase/messaging";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './DoctorDetailsPage.css'; // Import the CSS file

const DoctorDetailsPage = () => {
  const { patientId, deviceToken } = useAuth();
  // Use useLocation to access the location state
  const location = useLocation();
  const { doctorDetails } = location.state || {};
  const [selectedSlot, setSelectedSlot] = useState(null);
  // State for available time slots
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const apiHost = process.env.REACT_APP_API_URL;
  const msgApiHost = process.env.REACT_APP_MSG_API_URL;
  const apiKey = process.env.REACT_APP_API_KEY;
  const msgApiKey = process.env.REACT_APP_MSG_API_KEY;
  // Function to fetch booked appointments
  const fetchBookedAppointments = useCallback(() => {
    fetch(`${apiHost}/booked-appointments?patient_id=${patientId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      }
    })
      .then((response) => response.json())
      .then((data) => {
        setBookedAppointments(data);
      })
      .catch((error) => {
        console.error('Error fetching booked appointments:', error);
      });
  }, [patientId, apiKey, apiHost]);
  
  // Function to fetch booked appointments
  const fetchAvailableSlots = useCallback(() => {
    fetch(`${apiHost}/available-time-slots?doctor_id=${doctorDetails.doctor_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      }
    })
        .then((response) => response.json())
        .then((data) => {
          // Set the retrieved time slots in state
          setAvailableTimeSlots(data);
        })
        .catch((error) => {
          console.error('Error fetching available time slots:', error);
        });
  }, [doctorDetails, apiKey, apiHost]);

  // Function to send notifcation
  const sendNotification = async (deviceToken, title, message) => {
    // Payload for sending notifcation
    const requestBody = {
      device_token: deviceToken, 
      title: title,
      message: message,
    };

   try {
    const response = await fetch(`${msgApiHost}/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'x-api-key': msgApiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      console.log("Message sent successfully");
      // Handle success here, if needed
    } else {
      console.error("Failed to send message");
      // Handle error here, if needed
    }
  } catch (error) {
    console.error("Error sending message:", error);
    // Handle error here, if needed
  }
};

  useEffect(() => {
    if (doctorDetails) {
      fetchAvailableSlots();      
      fetchBookedAppointments();
    }
  }, [doctorDetails, fetchAvailableSlots, fetchBookedAppointments]);

 
  // Function to handle slot selection
  const handleSlotSelection = (slot) => {
    setSelectedSlot(slot)
    console.log('Selected slot:', slot, patientId);
  };

  // Function to handle booking appointment
  const handleBookAppointment = () => {
    // Check if a slot is selected
    if (!selectedSlot || Object.keys(selectedSlot).length === 0) {
      console.log('No slot selected');
      return;
    }

    // Payload for booking appointment
    const payload = {
      patient_id: patientId, 
      doctor_id: doctorDetails.doctor_id,
      appointment_date: selectedSlot.date,
      appointment_time: selectedSlot.time_slot,
    };

    // Make a POST request to book appointment
    fetch(`${apiHost}/book-appointment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        sendNotification(deviceToken, 'Appointment Booking', 'Your appointment is booked!');
        fetchBookedAppointments();
      })
      .catch((error) => {
        console.error('Error booking appointment:', error);
      });
  };

  // Function to handle canceling appointment
  const handleCancelAppointment = () => {
    // Check if a slot is selected
    if (!selectedSlot || Object.keys(selectedSlot).length === 0) {
      console.log('No slot selected for cancellation');
      return;
    }

    // Payload for canceling appointment
    const payload = {
      patient_id: selectedSlot.patient_id,      
      appointment_id: selectedSlot.appointment_id,
    };

    // Make a POST request to cancel appointment
    fetch(`${apiHost}/cancel-appointment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        sendNotification(deviceToken, 'Appointment Cancellation', 'Your appointment is cancelled!');
        fetchBookedAppointments();
      })
      .catch((error) => {
        console.error('Error canceling appointment:', error);
      });
  };

  const messaging = getMessaging();
  onMessage(messaging, (payload) => {
    console.log('Message received. ', payload);
    // Show a notification using react-toastify
    toast.success(payload.data.message, { autoClose: 5000 });
  });

  if (!doctorDetails) {
    // Handle the case when doctorDetails is not available
    return <div>No doctor details found</div>;
  }

  return (
    <div>
      <h2>{`Doctor Details and Available Time Slots`}</h2>

      {/* Display Doctor Details */}
      <div>
        <h3>{`Dr. ${doctorDetails.first_name} ${doctorDetails.last_name}`}</h3>
        <p>{`Experience: ${doctorDetails.experience} years`}</p>
        <p>{`Qualifications: ${doctorDetails.qualifications}`}</p>
      </div>

      {/* Available Time Slots */}
      <div>
        <h3>Available Time Slots</h3>
        {/* Display time slots using a table-like structure */}
        {availableTimeSlots.length === 0 ? (
          <p>No available time slots found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time Slot</th>
                <th>Select</th>
              </tr>
            </thead>
            <tbody>
              {availableTimeSlots.map((slot) => (
                <tr key={slot.availability_id}>
                  <td>{slot.date}</td>
                  <td>{slot.time_slot}</td>
                  <td>
                    <input
                      type="radio"
                      id={`slot-${slot.availability_id}`}
                      name="timeSlot"
                      value={slot.availability_id}
                      onChange={() => handleSlotSelection(slot)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
       {/* Button to Book Appointment */}
      {availableTimeSlots.length > 0 && (
        <button type="button" onClick={handleBookAppointment}>
          Book Appointment
        </button>
      )}

      <div>
        <h3>Booked Appointments</h3>
        {bookedAppointments.length === 0 ? (
          <p>No booked appointments found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time Slot</th>
                <th>Select</th>
              </tr>
            </thead>
            <tbody>
              {bookedAppointments.map((appointment) => (
                <tr key={appointment.appointment_id}>
                  <td>{appointment.appointment_date}</td>
                  <td>{appointment.appointment_time}</td>
                  <td>
                    <input
                      type="radio"
                      id={`appointment-${appointment.appointment_id}`}
                      name="appointment"
                      value={appointment.appointment_id}
                      onChange={() => handleSlotSelection(appointment)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {bookedAppointments.length > 0 && (
          <button type="button" onClick={handleCancelAppointment}>
            Cancel Appointment
          </button>
        )}
      </div>   
      
      <ToastContainer />
    </div>
  );
};

export default DoctorDetailsPage;
