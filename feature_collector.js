// feature_collector.js

function initialize({ param1, param2, param3 }) {
  // ...existing code...
  console.log(param1, param2, param3);
}

// main function
function main() {
  // Pass parameters as an object
  initialize({ param1: "value1", param2: "value2", param3: "value3" });
}

main();
