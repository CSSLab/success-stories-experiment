import React from "react";

export default class TimeoutButton extends React.Component {
  state = { ready: false };
  cancelCountdown = null;

  componentDidMount() {
    this.startTimer(null);
  }

  componentDidUpdate(prevProps) {
    this.startTimer(prevProps);
  }

  componentWillUnmount() {
    clearTimeout(this.cancelCountdown);
  }

  setReady = () => this.setState({ ready: true });

  setNotReady = () => this.setState({ ready: false });

  startTimer(prevProps) {
    if (!this.props.disabled && !this.state.ready) {
      this.cancelCountdown = setTimeout(this.setReady, this.props.timeout);
    } else if (this.props.disabled && this.cancelCountdown !== null) {
      clearTimeout(this.cancelCountdown);
      this.cancelCountdown = null;
      this.setNotReady();
    }
  }

  render() {
    let { disabled, timeout, onClick, ...props } = this.props;
    let { ready } = this.state;
    let isButtonDisabled = disabled || !ready;
    let guardedOnClick = isButtonDisabled ? () => {} : onClick;
    return (
      <button {...props} disabled={isButtonDisabled} onClick={guardedOnClick} />
    );
  }
}
