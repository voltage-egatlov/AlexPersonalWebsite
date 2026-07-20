export const metadata = {
  title: "Contact — Alexandra Nikita",
};

export default function ContactPage() {
  return (
    <div className="page">
      <div className="page-eyebrow">Correspondence</div>
      <h1 className="page-title">Contact</h1>
      <div className="contact-block">
        <div className="contact-row">
          <div className="label">Phone</div>
          <a className="value" href="tel:+17024445423">
            702.444.5423
          </a>
        </div>
        <div className="contact-row">
          <div className="label">Email</div>
          <a className="value" href="mailto:al3xandranikita@gmail.com">
            al3xandranikita@gmail.com
          </a>
        </div>
        <div className="contact-row">
          <div className="label">Instagram</div>
          <a className="value" href="#">
            Instagram ↗
          </a>
        </div>
      </div>
    </div>
  );
}
