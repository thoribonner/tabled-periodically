import { useState } from "react";
import { useHistory } from "react-router";
import { createReservation } from "../../utils/api";
import ErrorAlert from "../../layout/ErrorAlert";


export default function ReservationForm({ mode }) {
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

  const history = useHistory();

  const handleChange = ({ target }) => {
    //
    if (target.type === "number") {
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

  async function handleSubmit(e) {
    e.preventDefault();
    const ac = new AbortController();
    try {
      await createReservation(formData, ac.signal);
      history.push(`/dashboard?date=${formData.reservation_date}`)
    } catch (err) {
      setError(err);
    }
  }

  return (
    <>
      <ErrorAlert error={error} />
      <form className="form-group" onSubmit={handleSubmit}>
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
          type="text"
          className="form-control"
          name="mobile_number"
          id="mobile_number"
          placeholder="123-456-7890"
          value={formData.mobile_number}
          onChange={handleChange}
          required
        />
        <label htmlFor="reservation_date">Reservation Date <span className="text-muted">(closed Tuesdays)</span></label>
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
          placeholder="#"
          min="1"
          value={formData.people}
          onChange={handleChange}
          required
        />
        <div>
          <button className="btn btn-primary" type="submit">Submit</button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={history.goBack}
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}
