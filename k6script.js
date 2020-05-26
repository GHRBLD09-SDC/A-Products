import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate } from "k6/metrics";

let errorRate = new Rate("errors");
let upperErrorRate = new Rate("upper errors");
let UpperTrend = new Trend("Upper reqs");
let RegTrend = new Trend("Reg Trend");

export let options = {
  stages: [
    { duration: "2m", target: 1 }, // below normal load
    { duration: "2m", target: 10 }, // normal load
    { duration: "2m", target: 100 }, // around the breaking point
    // { duration: "5m", target: 1000 }, // beyond the breaking point
    { duration: "5m", target: 0 }, // scale down. Recovery stage.
  ],
};
export default function () {
  const BASE_URL = "http://localhost:3000";

  const randInt = () => {
    return Math.floor(Math.random() * 10000000);
  };

  const upperRandInt = () => {
    return Math.floor(Math.random() * 1000000) + 9000000;
  };

  let requests = {
    "Upper req": {
      method: "GET",
      url: `${BASE_URL}/api/${upperRandInt()}`,
    },
    "Reg req": {
      method: "GET",
      url: `${BASE_URL}/api/${randInt()}`,
    },
  };

  let responses = http.batch(requests);
  let upperResp = responses["Upper req"];
  let regResp = responses["Reg req"];

  check(upperResp, {
    "status is 200": (r) => r.status == 200,
  }) || upperErrorRate.add(1);

  UpperTrend.add(upperResp.timings.duration);

  check(regResp, {
    "status is 200": (r) => r.status == 200,
  }) || errorRate.add(1);

  RegTrend.add(regResp.timings.duration);

  sleep(1);
}
