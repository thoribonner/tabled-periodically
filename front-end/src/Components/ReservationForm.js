import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import {
  createReservation,
  readReservation,
  updateReservation,
} from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { formatAsDate } from "../utils/date-time";

export default function ReservationForm() {
  const initialFormData = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: "",
  };
  const [formData, setFormData] = useState({ ...initialFormData });
  const [error, setError] = useState(null);
  const { reservation_id } = useParams();

  const history = useHistory();

  useEffect(loadFormData, [reservation_id]);

  function loadFormData() {
    const ac = new AbortController();

    async function loadReservation() {
      try {
        const loadedRes = await readReservation(reservation_id, ac.signal);

        console.log(loadedRes.reservation_date);

        setFormData({
          ...loadedRes,
          reservation_date: formatAsDate(loadedRes.reservation_date),
        });
      } catch (err) {
        setError(err);
      }
    }
    if (reservation_id) loadReservation();
    return () => ac.abort();
  }

  const formatPhoneNumber = (num) => {
    if (!num) return num;
    const mobNum = num.replace(/[^\d]/g, "");
    const len = mobNum.length;

    if (len < 4) return mobNum;
    if (len < 7) return `(${mobNum.slice(0, 3)}) ${mobNum.slice(3)}`;
    return `(${mobNum.slice(0, 3)}) ${mobNum.slice(3, 6)}-${mobNum.slice(
      6,
      10
    )}`;
  };

  const handleChange = ({ target }) => {
    if (target.type === "tel") {
      setFormData({
        ...formData,
        [target.name]: formatPhoneNumber(target.value),
      });
    } else if (target.type === "number") {
      setFormData({
        ...formData,
        [target.name]: Number(target.value),
      });
    } else {
      setFormData({
        ...formData,
        [target.name]: target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    console.log(formData);
    e.preventDefault();
    const ac = new AbortController();
    try {
      if (reservation_id) {
        await updateReservation(formData, ac.signal);
      } else {
        await createReservation(formData, ac.signal);
      }
      history.push(`/dashboard?date=${formData.reservation_date}`);
    } catch (err) {
      setError(err);
    }
  };

  return (
    <form className="form-group" onSubmit={handleSubmit}>
      <ErrorAlert error={error} />
      <label htmlFor="first_name">First Name</label>
      <input
        type="text"
        className="form-control"
        name="first_name"
        id="first_name"
        placeholder="First Name"
        value={formData.first_name}
        onChange={handleChange}
        required
      />
      <label htmlFor="last_name">Last Name</label>
      <input
        type="text"
        className="form-control"
        name="last_name"
        id="last_name"
        placeholder="last Name"
        value={formData.last_name}
        onChange={handleChange}
        required
      />
      <label htmlFor="mobile_number">Mobile Number</label>
      <input
        type="tel"
        className="form-control"
        name="mobile_number"
        id="mobile_number"
        placeholder="123-456-7890"
        value={formData.mobile_number}
        onChange={handleChange}
        required
      />
      <label htmlFor="reservation_date">
        Reservation Date <span className="text-muted">(closed Tuesdays)</span>
      </label>
      <input
        type="date"
        className="form-control"
        name="reservation_date"
        id="reservation_date"
        placeholder="YYYY-MM-DD"
        pattern="\d{4}-\d{2}-\d{2}"
        value={formData.reservation_date}
        onChange={handleChange}
        required
      />
      <label htmlFor="reservation_time">Reservation Time</label>
      <input
        type="time"
        className="form-control"
        name="reservation_time"
        id="reservation_time"
        placeholder="HH:MM"
        pattern="[0-9]{2}:[0-9]{2}"
        value={formData.reservation_time}
        onChange={handleChange}
        required
      />
      <label htmlFor="people">Party Size</label>
      <input
        type="number"
        className="form-control"
        name="people"
        id="people"
        placeholder="1"
        min="1"
        value={formData.people}
        onChange={handleChange}
        required
      />
      <div>
        <button className="btn btn-primary" type="submit">
          Submit
        </button>
        <button className="btn btn-dark" type="button" onClick={history.goBack}>
          Cancel
        </button>
      </div>
    </form>
  );
}
