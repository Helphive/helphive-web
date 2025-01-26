import "./foot.css"

const Footer = () => {
  return (
    <footer className="footer">
      <div className="social-icons">
        <a href="https://facebook.com" className="icon">
          <i className="fab fa-facebook-f"></i>
        </a>
        <a href="https://whatsapp.com" className="icon">
          <i className="fab fa-whatsapp"></i>
        </a>
        <a href="https://instagram.com" className="icon">
          <i className="fab fa-instagram"></i>
        </a>
        <a href="mailto:support@helphive.com" className="icon">
          <i className="fas fa-envelope"></i>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
