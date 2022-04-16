import ReservationDetail from "./ReservationDetail";
import './reservations.css'
export default function ReservationsList({ reservations, setError }) {
 
  
  return (
    <div className="reservations-list">
      {reservations.map((reservation) => (
        <ReservationDetail
          key={reservation.reservation_id}
          reservation={reservation}
          setError={setError}
        />
      ))}
    </div>
  );
}
