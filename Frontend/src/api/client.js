// const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// export async function apiRequest(endpoint, options = {}) {
//   const token = localStorage.getItem('token');
//   const res = await fetch(${BASE_URL}, {
//     headers: {
//       'Content-Type': 'application/json',
//       ...(token ? { Authorization: Bearer  } : {}),
//       ...(options.headers || {})
//     },
//     ...options
//   });
//   if (!res.ok) {
//     const errText = await res.text();
//     throw new Error(errText || Request failed: );
//   }
//   return res.json();
// }
