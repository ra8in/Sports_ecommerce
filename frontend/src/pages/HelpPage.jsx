import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function HelpPage() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1))
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    } else {
      window.scrollTo(0, 0)
    }
  }, [location])

  return (
    <main>
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link><svg className="icon"><use href="#i-chevron-right"/></svg><span>Help & Support</span>
        </div>
      </div>
      
      <div className="container page-head">
        <h1>Help & Support.</h1>
        <p className="lede">Find answers to common questions about shipping, returns, and finding the perfect size for your sporting gear.</p>
      </div>

      <div className="container section" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: 0 }}>
        
        {/* Shipping Section */}
        <div id="shipping" style={{ paddingTop: '80px', marginTop: '-40px' }}>
          <h2 style={{ marginBottom: '24px', fontSize: '1.7rem' }}>Shipping Policy</h2>
          <div style={{ background: 'var(--surface)', padding: '32px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
            <h4 style={{ marginBottom: '12px' }}>Domestic Delivery (Nepal)</h4>
            <p className="pd-desc" style={{ marginTop: 0, marginBottom: '20px' }}>
              We proudly offer nationwide shipping across Nepal with a priority on speed and reliability.
            </p>
            <ul style={{ paddingLeft: '20px', color: 'var(--ink-soft)', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              <li style={{ listStyleType: 'disc' }}><strong>Fast Delivery:</strong> Expect your order within 1-2 business days under ideal circumstances.</li>
              <li style={{ listStyleType: 'disc' }}><strong>Order Tracking:</strong> You'll receive updates as soon as your gear leaves our facility.</li>
              <li style={{ listStyleType: 'disc' }}><strong>Reliable Packaging:</strong> All items are securely boxed to ensure they arrive in perfect condition.</li>
            </ul>
          </div>
        </div>

        {/* Returns Section */}
        <div id="returns" style={{ paddingTop: '80px', marginTop: '-40px' }}>
          <h2 style={{ marginBottom: '24px', fontSize: '1.7rem' }}>Returns & Exchanges</h2>
          <div style={{ background: 'var(--surface)', padding: '32px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
            <p className="pd-desc" style={{ marginTop: 0 }}>
              We want you to be fully satisfied with your athletic gear. If you are not completely happy with your purchase, you may return it under the following conditions:
            </p>
            <div style={{ background: 'var(--surface-2)', padding: '16px 20px', borderRadius: 'var(--radius-sm)', margin: '20px 0' }}>
              <strong>The 7-Day Rule:</strong> Items must be returned within 7 days of the delivery date.
            </div>
            <ul style={{ paddingLeft: '20px', color: 'var(--ink-soft)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li style={{ listStyleType: 'disc' }}>The item must be unused, unwashed, and in the exact condition you received it.</li>
              <li style={{ listStyleType: 'disc' }}>All original tags and packaging must remain fully intact.</li>
              <li style={{ listStyleType: 'disc' }}>Innerwear, socks, and sports nutrition products are strictly non-returnable for hygiene reasons.</li>
              <li style={{ listStyleType: 'disc' }}>To initiate a return, please contact our support team at contact@sportshop.com.</li>
            </ul>
          </div>
        </div>

        {/* Size Guide Section */}
        <div id="size-guide" style={{ paddingTop: '80px', marginTop: '-40px', paddingBottom: '80px' }}>
          <h2 style={{ marginBottom: '24px', fontSize: '1.7rem' }}>Universal Size Guide</h2>
          <div style={{ background: 'var(--surface)', padding: '32px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
            <p className="pd-desc" style={{ marginTop: 0, marginBottom: '24px' }}>
              Finding the right fit is crucial for peak performance. Use our general sizing charts below. <em>Note: Fits may vary slightly between specific brands like Nike or Puma.</em>
            </p>
            
            <h4 style={{ marginBottom: '12px' }}>Men's Apparel</h4>
            <div style={{ overflowX: 'auto', marginBottom: '32px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '400px' }}>
                <thead>
                  <tr style={{ background: 'var(--ink)', color: 'var(--white)' }}>
                    <th style={{ padding: '10px 16px', borderTopLeftRadius: '4px' }}>Size</th>
                    <th style={{ padding: '10px 16px' }}>Chest (in)</th>
                    <th style={{ padding: '10px 16px', borderTopRightRadius: '4px' }}>Waist (in)</th>
                  </tr>
                </thead>
                <tbody style={{ color: 'var(--ink-soft)' }}>
                  <tr style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600 }}>Small (S)</td>
                    <td style={{ padding: '10px 16px' }}>35 - 37</td>
                    <td style={{ padding: '10px 16px' }}>29 - 31</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600 }}>Medium (M)</td>
                    <td style={{ padding: '10px 16px' }}>38 - 40</td>
                    <td style={{ padding: '10px 16px' }}>32 - 34</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600 }}>Large (L)</td>
                    <td style={{ padding: '10px 16px' }}>41 - 43</td>
                    <td style={{ padding: '10px 16px' }}>35 - 37</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 16px', fontWeight: 600 }}>X-Large (XL)</td>
                    <td style={{ padding: '10px 16px' }}>44 - 46</td>
                    <td style={{ padding: '10px 16px' }}>38 - 40</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 style={{ marginBottom: '12px' }}>Women's Apparel</h4>
            <div style={{ overflowX: 'auto', marginBottom: '32px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '400px' }}>
                <thead>
                  <tr style={{ background: 'var(--ink)', color: 'var(--white)' }}>
                    <th style={{ padding: '10px 16px', borderTopLeftRadius: '4px' }}>Size</th>
                    <th style={{ padding: '10px 16px' }}>Bust (in)</th>
                    <th style={{ padding: '10px 16px', borderTopRightRadius: '4px' }}>Waist (in)</th>
                  </tr>
                </thead>
                <tbody style={{ color: 'var(--ink-soft)' }}>
                  <tr style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600 }}>Small (S)</td>
                    <td style={{ padding: '10px 16px' }}>33 - 35</td>
                    <td style={{ padding: '10px 16px' }}>26 - 28</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600 }}>Medium (M)</td>
                    <td style={{ padding: '10px 16px' }}>36 - 38</td>
                    <td style={{ padding: '10px 16px' }}>29 - 31</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600 }}>Large (L)</td>
                    <td style={{ padding: '10px 16px' }}>39 - 41</td>
                    <td style={{ padding: '10px 16px' }}>32 - 34</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 16px', fontWeight: 600 }}>X-Large (XL)</td>
                    <td style={{ padding: '10px 16px' }}>42 - 44</td>
                    <td style={{ padding: '10px 16px' }}>35 - 37</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 style={{ marginBottom: '12px' }}>Footwear (Unisex)</h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '400px' }}>
                <thead>
                  <tr style={{ background: 'var(--ink)', color: 'var(--white)' }}>
                    <th style={{ padding: '10px 16px', borderTopLeftRadius: '4px' }}>UK Size</th>
                    <th style={{ padding: '10px 16px' }}>US Size</th>
                    <th style={{ padding: '10px 16px', borderTopRightRadius: '4px' }}>EU Size</th>
                  </tr>
                </thead>
                <tbody style={{ color: 'var(--ink-soft)' }}>
                  <tr style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600 }}>6</td>
                    <td style={{ padding: '10px 16px' }}>7</td>
                    <td style={{ padding: '10px 16px' }}>40</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600 }}>7</td>
                    <td style={{ padding: '10px 16px' }}>8</td>
                    <td style={{ padding: '10px 16px' }}>41</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600 }}>8</td>
                    <td style={{ padding: '10px 16px' }}>9</td>
                    <td style={{ padding: '10px 16px' }}>42.5</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600 }}>9</td>
                    <td style={{ padding: '10px 16px' }}>10</td>
                    <td style={{ padding: '10px 16px' }}>44</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 16px', fontWeight: 600 }}>10</td>
                    <td style={{ padding: '10px 16px' }}>11</td>
                    <td style={{ padding: '10px 16px' }}>45</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>
    </main>
  )
}
