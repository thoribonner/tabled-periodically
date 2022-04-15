import { useHistory } from "react-router";
import { openTable } from "../../utils/api";

export default function TableDetail({ table, setError }) {
  const history = useHistory();

  const handleFinish = async (e) => {
    const finish = window.confirm(
      "Is this table ready to seat new guests? This cannot be undone."
    );
    if (finish) {
      try {
        await openTable(table.table_id)
        history.go();
      } catch (err) {
        setError(err);
      }
    }
  };


  // const status = table.reservation_id ? (
  //   <td data-table-id-status={table.table_id}>
  //        Occupied
  //       {/* <span className="mr-3">Occupied</span> */}
  //       {/* <button
  //             type="submit"
  //             data-table-id-finish={`${table.table_id}`}
  //             className="btn btn-dark"
  //             onClick={handleFinish}
  //           >
  //             Finish
  //           </button> */}
  //   </td>
  // ) : (
  //   <td>Free</td>
  // );

  return (
    <tr>
      <td>{table.table_id}</td>
      <td>{table.table_name}</td>
      <td>{table.capacity}</td>
      <td data-table-id-status={table.table_id}>
        {table.reservation_id ? (
          <div className="">
            <span className="mr-3">Occupied</span>
            <button
              type="submit"
              data-table-id-finish={`${table.table_id}`}
              className="btn btn-dark"
              onClick={handleFinish}
            >
              Finish
            </button>
          </div>
        ) : (
          "Free"
        )}
      </td>
    </tr>
  );
}
