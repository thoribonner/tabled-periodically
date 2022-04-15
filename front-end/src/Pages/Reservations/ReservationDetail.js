import { Link } from "react-router-dom";
import { useHistory } from "react-router";
import { cancelReservation } from "../../utils/api";
import dateFormat from "../../utils/dateFormat";
import formatTime from "../../utils/timeFormat";

export default function ReservationDetail({ reservation, setError }) {
  const history = useHistory();
  const {
    reservation_id,
    reservation_date,
    reservation_time,
    first_name,
    last_name,
    mobile_number,
    status,
    people,
  } = reservation;

  const handleCancel = async (e) => {
    const ac = new AbortController();
    const finish = window.confirm(
      "Do you want to cancel this reservation? This cannot be undone."
    );
    if (finish) {
      try {
        setError(null)
        await cancelReservation(reservation_id, ac.signal);
        history.go();
      } catch (err) {
        setError(err);;
      }
    }
  };

  return (
    <div className="card border border-warning rounded my-2 col">
      <div className="card-body">
        <h3 className="card-header">
          {first_name} {last_name}
        </h3>
        <p className="card-text text-muted">
          Party of <span className="dark">{people}</span> expected{" "}
          <span className="dark">
            {dateFormat(reservation_date)} {formatTime(reservation_time)}
          </span>
        </p>
        <p className="card-text text-muted">
          Contact: <span className="dark">{mobile_number}</span>
        </p>
        <p className="card-text text-muted">
          Reservation status:{" "}
          <span
            className="dark"
            data-reservation-id-status={reservation_id}
          >
            {status}
          </span>
        </p>
        {status === "booked" && (
          <Link
            to={`/reservations/${reservation_id}/seat`}
            className="btn btn-primary"
          >
            Seat
          </Link>
        )}
        <Link
          to={`/reservations/${reservation_id}/edit`}
          className="btn btn-warning"
        >
          Edit
        </Link>
        <button
          onClick={handleCancel}
          data-reservation-id-cancel={reservation_id}
          className="btn btn-dark"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
