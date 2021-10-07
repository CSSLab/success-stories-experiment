import "react-app-polyfill/ie9";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.values";
import "core-js/modules/es.object.entries";
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

ReactDOM.render(<App />, document.getElementById("root"));
