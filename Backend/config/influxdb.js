import { InfluxDB } from '@influxdata/influxdb-client';

// Load from your environment variables (.env)
const url = process.env.INFLUX_URL || 'https://us-east-1-1.aws.cloud2.influxdata.com';
const token = process.env.INFLUX_TOKEN;
const org = process.env.INFLUX_ORG;

const influxDB = new InfluxDB({ url, token });
export const queryApi = influxDB.getQueryApi(org);
export const bucket = process.env.INFLUX_BUCKET;