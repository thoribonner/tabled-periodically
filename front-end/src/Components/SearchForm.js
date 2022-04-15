export default function SearchForm({
  handleSubmit,
  handleChange,
  mobile_number,
}) {
  return (
    <form onSubmit={handleSubmit} className="form-inline">
      <div className="form-group ">
        <input
          type="text"
          name="mobile_number"
          value={mobile_number}
          onChange={handleChange}
          placeholder="123-456-7890"
          required
        />
      </div>
      <div className="form-group mx-3">
        <button type="submit" className="btn btn-dark">
          Find
        </button>
      </div>
    </form>
  );
}
