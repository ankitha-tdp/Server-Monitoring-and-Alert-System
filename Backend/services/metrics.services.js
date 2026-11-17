import { queryApi, bucket } from '../config/influxdb.js';

// Helper function to execute a single Flux query
const queryInflux = async (fluxQuery) => {
  const results = [];
  for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
    const o = tableMeta.toObject(values);
    results.push({ time: o._time, value: o._value });
  }
  return results;
};

export const fetchAllDeviceMetrics = async (deviceId) => {
  // Define queries for CPU, RAM, and Disk
  const cpuQuery = `
    from(bucket: "${bucket}")
      |> range(start: -1h)
      |> filter(fn: (r) => r["_measurement"] == "cpu")
      |> filter(fn: (r) => r["device_id"] == "${deviceId}")
      |> filter(fn: (r) => r["_field"] == "usage_user")
      |> yield(name: "mean")
  `;

  const memQuery = `
    from(bucket: "${bucket}")
      |> range(start: -1h)
      |> filter(fn: (r) => r["_measurement"] == "mem")
      |> filter(fn: (r) => r["device_id"] == "${deviceId}")
      |> filter(fn: (r) => r["_field"] == "used_percent")
      |> yield(name: "mean")
  `;

  const diskQuery = `
    from(bucket: "${bucket}")
      |> range(start: -1h)
      |> filter(fn: (r) => r["_measurement"] == "disk")
      |> filter(fn: (r) => r["device_id"] == "${deviceId}")
      |> filter(fn: (r) => r["_field"] == "used_percent")
      |> yield(name: "mean")
  `;

  // Run all three queries concurrently for speed
  const [cpu, memory, disk] = await Promise.all([
    queryInflux(cpuQuery),
    queryInflux(memQuery),
    queryInflux(diskQuery),
  ]);

  return { cpu, memory, disk };
};