import { queryApi, bucket } from '../config/influx.js';

export const fetchDeviceCpuMetrics = async (deviceId) => {
  const fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: -1h)
      |> filter(fn: (r) => r["_measurement"] == "cpu")
      |> filter(fn: (r) => r["device_id"] == "${deviceId}")
      |> filter(fn: (r) => r["_field"] == "usage_user")
      |> yield(name: "mean")
  `;

  const results = [];

  for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
    const o = tableMeta.toObject(values);
    results.push({
      time: o._time,
      value: o._value,
    });
  }

  return results;
};