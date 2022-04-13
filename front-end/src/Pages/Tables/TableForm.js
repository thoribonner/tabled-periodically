import { useState } from "react";
import { useHistory } from "react-router";
import ErrorAlert from "../../layout/ErrorAlert";
import { createTable } from "../../utils/api";

export default function TableForm() {
  const initialFormData = {
    table_name: "",
    capacity: "",
  };

  const [formData, setFormData] = useState({ ...initialFormData });
  const [error, setError] = useState(null);

  const history = useHistory();

  const handleChange = ({ target }) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ac = new AbortController();
    try {
      await createTable(formData, ac.signal)
      history.push('/')
    } catch (err) {
      setError(err)
    }
  };

  return (
    <form className="form-group" onSubmit={handleSubmit}>
      <ErrorAlert error={error} />
      <label htmlFor="table_name">Table Name</label>
      <input
        type="text"
        className="form-control"
        name="table_name"
        id="table_name"
        placeholder="Table Name"
        value={formData.table_name}
        onChange={handleChange}
        required
      />
      <label htmlFor="capacity">Table Capacity</label>
      <input
        type="number"
        className="form-control"
        name="capacity"
        id="capacity"
        placeholder="1"
        value={formData.capacity}
        onChange={handleChange}
        required
      />
      <button type="submit" className="btn btn-primary">Submit</button>
      <button type="button" className="btn btn-dark" onClick={history.goBack}>Cancel</button>
    </form>
  );
}
