import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="wordmark"><span className="mark">Sport</span>Shop</Link>
            <p>Premium sports equipment and apparel sourced from top brands worldwide. Quality gear for every athlete.</p>
            <div className="footer-social">
              <Link className="icon-btn" to="/about-us" aria-label="Location"><svg className="icon icon-sm"><use href="#i-pin"/></svg></Link>
              <Link className="icon-btn" to="/about-us" aria-label="Email"><svg className="icon icon-sm"><use href="#i-mail"/></svg></Link>
            </div>
          </div>
          <div className="footer-col">
            <h5>Shop</h5>
            <ul>
              <li><Link to="/shop?category=football">Football</Link></li>
              <li><Link to="/shop?category=basketball">Basketball</Link></li>
              <li><Link to="/shop?category=cricket">Cricket</Link></li>
              <li><Link to="/shop?category=running">Running</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Info</h5>
            <ul>
              <li><Link to="/about-us">About Us</Link></li>
              <li><Link to="/about-us">Contact Us</Link></li>
              <li><Link to="/privacy">Privacy</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Help</h5>
            <ul>
              <li><Link to="/help#shipping">Shipping</Link></li>
              <li><Link to="/help#returns">Returns</Link></li>
              <li><Link to="/help#size-guide">Size Guide</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Visit</h5>
            <ul>
              <li><span style={{ fontSize: '0.88rem', color: 'var(--ink-soft)' }}>Baneshwor, Kathmandu</span></li>
              <li><span style={{ fontSize: '0.88rem', color: 'var(--ink-soft)' }}>Nepal</span></li>
              <li><a href="mailto:contact@sportshop.com">contact@sportshop.com</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 SportShop Nepal</span>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/help">Help Center</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
