import { Link } from 'react-router-dom'

export default function AboutUsPage() {
  return (
    <main>
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link><svg className="icon"><use href="#i-chevron-right"/></svg><span>About Us</span>
        </div>
      </div>
      
      <div className="container page-head">
        <h1>About SportShop.</h1>
        <p className="lede">Equipping athletes with authentic, premium gear since 2026. Because true passion deserves the best quality.</p>
      </div>

      <div className="container section">
        <div className="editorial">
          <div className="editorial-art">
            <svg viewBox="0 0 100 100"><use href="#o-football"/></svg>
          </div>
          <div className="section-head-copy">
            <div className="eyebrow">Our Mission</div>
            <h2>Elevating the Game.</h2>
            <p className="pd-desc" style={{ marginTop: 0 }}>
              SportShop is the premier platform where people can buy premium products related to sports. Founded in Baneshwor, Kathmandu, our simple goal is to provide the local sporting community with direct access to the world’s most renowned and authentic athletic gear.
            </p>
            <p className="pd-desc" style={{ marginTop: '-10px' }}>
              We understand that what you wear and what you play with matters. That's why every product in our catalog goes through rigorous quality checks to guarantee you get exactly what you pay for — unparalleled performance and durability.
            </p>
            <blockquote className="pull-quote" style={{ marginTop: '24px' }}>
              “A champion is driven by passion, but built on precision. We deliver the precision.”
            </blockquote>
          </div>
        </div>
      </div>

      <div className="section section-alt">
        <div className="container">
          <div className="section-head">
            <div className="section-head-copy">
              <div className="eyebrow">Why Choose Us</div>
              <h2>Built for Athletes.</h2>
            </div>
          </div>
          <div className="value-strip">
            <div className="value-item">
              <svg className="icon"><use href="#i-shield"/></svg>
              <div>
                <h4>100% Authentic</h4>
                <p>We source directly from global manufacturers to ensure zero counterfeit products.</p>
              </div>
            </div>
            <div className="value-item">
              <svg className="icon"><use href="#i-truck"/></svg>
              <div>
                <h4>Fast Delivery</h4>
                <p>Same-day dispatch within Kathmandu, and quick shipping across Nepal.</p>
              </div>
            </div>
            <div className="value-item">
              <svg className="icon"><use href="#i-star"/></svg>
              <div>
                <h4>Premium Quality</h4>
                <p>Only the strongest, most resilient materials make it to our shelves.</p>
              </div>
            </div>
            <div className="value-item">
              <svg className="icon"><use href="#i-heart"/></svg>
              <div>
                <h4>Dedicated Support</h4>
                <p>Our team consists of passionate sports enthusiasts ready to help you gear up.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container section">
        <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', padding: '56px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h2>Get in Touch</h2>
          <p className="lede" style={{ maxWidth: '50ch', margin: '16px auto 32px' }}>
            Have a question about a product, or need support with a recent order? We are here to help. Drop by our store or send us an email.
          </p>
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg className="icon"><use href="#i-pin"/></svg></span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Baneshwor, Kathmandu, Nepal</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>Sun–Fri, 10am–6pm</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg className="icon"><use href="#i-mail"/></svg></span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Email Us</div>
                <a href="mailto:contact@sportshop.com" style={{ fontSize: '0.8rem', color: 'var(--sienna)' }}>contact@sportshop.com</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
