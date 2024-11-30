import "./Navbar.css";

export default function Navbar() {
  return (
    <div className="navbar">
      <div className="navbar-logo">
        <span className="full-text">
          <span className="s">S</span><span className="rest">mart </span>
          <span className="a">A</span><span className="rest">ssessment </span>
          <span className="t">T</span><span className="rest">racking </span>
          <span className="y">Y</span><span className="rest">our </span>
          <span className="last-a">A</span><span className="rest">pplicants</span>
        </span>
        <span className="short-text">
          <span className="s">S</span>
          <span className="a">A</span>
          <span className="t">T</span>
          <span className="y">Y</span>
          <span className="last-a">A</span>
        </span>
      </div>
    </div>
  );
}
