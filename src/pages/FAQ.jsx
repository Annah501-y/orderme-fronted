import "../pages_styles/faq.css";

const faqs = [
  {
    question: "How do I place an order?",
    answer:
      "Choose a product, add it to your cart, then continue to checkout to enter your delivery address and payment details.",
  },
  {
    question: "Can I add items to my cart without an account?",
    answer:
      "Yes. You can add items to your cart or wishlist without signing in. You will need to provide your details when placing an order.",
  },
  {
    question: "How can I track my order?",
    answer: "Open your account's Orders page to see the latest status of your order.",
  },
  {
    question: "How do I contact support?",
    answer: "Visit the Help Center for support information and assistance.",
  },
];

/** A concise FAQ view; the callback keeps Help Center navigation in its overlay. */
export default function FAQ({ onOpenHelpCenter }) {
  return (
    <section className="faq-page">
      <h2>Frequently Asked Questions</h2>
      <div className="faq-list">
        {faqs.map(({ question, answer }) => (
          <details className="faq-item" key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
      <p className="faq-help-link">
        Need more help?{" "}
        <a
          href="#help-center"
          onClick={(event) => {
            event.preventDefault();
            onOpenHelpCenter?.();
          }}
        >
          Visit the Help Center
        </a>
      </p>
    </section>
  );
}
