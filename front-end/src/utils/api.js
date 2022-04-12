/**
 * Defines the base URL for the API.
 * The default values is overridden by the `API_BASE_URL` environment variable.
 */
 import formatReservationDate from "./format-reservation-date";
 import formatReservationTime from "./format-reservation-date";
 
 const API_BASE_URL =
   process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";
 
 const resUrl = new URL(`${API_BASE_URL}/reservations`);
 const tabUrl = new URL(`${API_BASE_URL}/tables`);
 
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
   if (params) {
     Object.entries(params).forEach(([key, value]) =>
       resUrl.searchParams.append(key, value.toString())
     );
     return await fetchJson(resUrl, { headers, signal }, [])
       .then(formatReservationDate)
       .then(formatReservationTime);
   } else {
     return await fetchJson(resUrl, { headers, signal }, []);
   }
 }
 
 export async function createReservation(reservation, signal) {
   const options = {
     method: "POST",
     headers,
     body: JSON.stringify({ data: reservation }),
     signal,
   };
 
   return await fetchJson(resUrl, options);
 }
 
 export async function updateReservation(reservation, signal) {
   const url = `${resUrl}/${reservation.reservation_id}`;
   const options = {
     method: "PUT",
     headers,
     body: JSON.stringify({ data: reservation }),
     signal,
   };
   return await fetchJson(url, options, reservation);
 }
 
 export async function cancelReservation(reservationId, signal) {
   const url = `${resUrl}/${reservationId}/status`;
   const options = {
     method: "PUT",
     headers,
     body: JSON.stringify({ data: { status: "cancelled" } }),
     signal,
   };
   return await fetchJson(url, options);
 }
 
 export async function listTables(signal) {
   return await fetchJson(tabUrl, { signal });
 }
 
 export async function createTable(table, signal) {
   const options = {
     method: "POST",
     headers,
     body: JSON.stringify({ data: table }),
     signal,
   };
   return await fetchJson(tabUrl, options, table);
 }
 
 export async function updateTable(reservationId, tableId, signal) {
   const url = `${tabUrl}/${tableId}/seat`;
   const options = {
     method: "PUT",
     headers,
     body: JSON.stringify({
       data: {
         reservation_id: reservationId,
       },
     }),
     signal,
   };
   return await fetchJson(url, options);
 }
 
 export async function closeTable(table_id, signal) {
   const url = `${tabUrl}/${table_id}/seat`;
   const options = {
     method: "DELETE",
     signal,
   };
   return await fetchJson(url, options);
 }
 