import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import dateFormat from "../../utils/dateFormat";
import formatTime from "../../utils/timeFormat";

export default function ReservationDetail({ reservation }) {
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
  return (
    <div className="card border border-warning rounded my-2 col">
      <div className="card-body">
        <h5 className="card-header">
          {first_name} {last_name}
        </h5>
        <p className="card-text text-muted">
          Party of <span className="text-primary">{people}</span>{" "}
          expected{" "}
          <span className="text-primary">
            {dateFormat(reservation_date)}{" "}
            {formatTime(reservation_time)}
          </span>
        </p>
        <p className="card-text text-muted">
          Contact:{" "}
          <span className="text-primary">{mobile_number}</span>
        </p>
        <p className="card-text text-muted">
          Reservation status:{" "}
          <span className="text-primary">{status}</span>
        </p>
        <a
          href={`/reservations/${reservation_id}/seat`}
          className="btn btn-primary"
        >
          Seat
        </a>
        <Link to={`/reservations/${reservation_id}/edit`} className="btn btn-warning">
          Edit
        </Link>
        <Link to={history.goBack} className="btn btn-dark">
          Cancel
        </Link>
      </div>
    </div>
  );
}
