/**
 * Defines the base URL for the API.
 * The default values is overridden by the `API_BASE_URL` environment variable.
 */
import formatReservationDate from "./format-reservation-date";
import formatReservationTime from "./format-reservation-date";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";



const headers = new Headers();
headers.append("Content-Type", "application/json");

async function fetchJson(url, options, onCancel) {
  try {
    const response = await fetch(url, options);
    if (response.status === 204) {
      return null;
    }

    const payload = await response.json();

    if (payload.error) {
      return Promise.reject({ message: payload.error });
    }
    return payload.data;
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error.stack);
      throw error;
    }
    return Promise.resolve(onCancel);
  }
}

export async function listReservations(params, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  if (params) {
    Object.entries(params).forEach(([key, value]) =>
      url.searchParams.append(key, value.toString())
    );
    return await fetchJson(url, { headers, signal }, [])
      .then(formatReservationDate)
      .then(formatReservationTime);
  } else {
    return await fetchJson(url, { headers, signal }, []);
  }
}

export async function readReservation(reservation_id, signal) {
  const url = new URL(`${API_BASE_URL}/reservations/${reservation_id}`);
  return  await fetchJson(url, { signal }, {})
}

export async function createReservation(reservation, signal) {
  console.log('made it to front end create reservation api call')
  const url = new URL(`${API_BASE_URL}/reservations`);
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify({ data: reservation }),
    signal,
  };

  return await fetchJson(url, options);
}

export async function cancelReservation(reservationId, signal) {
  const url = `${API_BASE_URL}/reservations/${reservationId}/status`;
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: { status: "cancelled" } }),
    signal,
  };
  return await fetchJson(url, options);
}

export async function listTables(signal) {
  const url = new URL(`${API_BASE_URL}/tables`);

  return await fetchJson(url, { headers, signal });
}

export async function createTable(table, signal) {
  const url = `${API_BASE_URL}/tables`;

  const options = {
    method: "POST",
    headers,
    body: JSON.stringify({ data: table }),
    signal,
  };
  return await fetchJson(url, options, table);
}

export async function seatTable(reservation_id, table_id, signal) {
  const url = `${API_BASE_URL}/tables/${table_id}/seat`;
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({
      data: {
        reservation_id
      },
    }),
    signal,
  };
  return await fetchJson(url, options);
}

export async function openTable( table_id, signal) {
  const url = `${API_BASE_URL}/tables/${table_id}/seat`;
  const options = {
    method: "DELETE",
    signal,
  };
  return await fetchJson(url, options);
}
