import React, { useContext } from "react";
import { now } from "./utils";

export let AppContext = React.createContext({});
export let AppContextProvider = AppContext.Provider;
export let AppContextConsumer = AppContext.Consumer;

let START = "Start";

export function useContextState(key, initialState) {
  let { appState, setAppState, setTracking } = useContext(AppContext);

  if (!(key in appState)) {
    setAppState(appState => ({ ...appState, [key]: initialState }));
    // don't track time here since there was no interaction
  }

  setTracking(tracking => {
    if (!(START in tracking)) {
      return { ...tracking, [START]: now() };
    } else {
      return tracking;
    }
  });

  let setter = newVal => {
    setAppState(prevState => ({ ...prevState, [key]: newVal }));
    setTracking(tracking => ({ ...tracking, [key]: now() }));
  };
  let value = key in appState ? appState[key] : initialState;
  return [value, setter];
}

export function useReadContext(key) {
  let { appState } = useContext(AppContext);
  return appState[key];
}
