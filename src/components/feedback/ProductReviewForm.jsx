import React, { useState } from "react";
import { submitProductReview } from "../../api/customerFeedback";

/**
 * Sends a review for a product in a specific order.
 * The backend checks that the signed-in buyer owns that order and product.
 */
export default function ProductReviewForm({ orderId, productId }) {
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      const response = await submitProductReview({
        productId,
        orderId,
        rating: Number(rating),
        comment: comment.trim(),
      });

      setMessage(
        response.data?.message || "Your review was submitted for approval."
      );
      setComment("");
    } catch (requestError) {
      const fieldErrors = requestError.response?.data?.errors;
      const firstFieldError = fieldErrors
        ? Object.values(fieldErrors).flat()[0]
        : null;

      setError(
        firstFieldError ||
          requestError.response?.data?.message ||
          "The review could not be submitted. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="buyer-product-review-form" onSubmit={handleSubmit}>
      <label htmlFor={`review-rating-${orderId}-${productId}`}>
        Your rating
      </label>

      <select
        id={`review-rating-${orderId}-${productId}`}
        value={rating}
        onChange={(event) => setRating(event.target.value)}
        required
      >
        <option value="5">5 — Excellent</option>
        <option value="4">4 — Very good</option>
        <option value="3">3 — Good</option>
        <option value="2">2 — Fair</option>
        <option value="1">1 — Poor</option>
      </select>

      <label htmlFor={`review-comment-${orderId}-${productId}`}>
        Comment <span>(optional)</span>
      </label>

      <textarea
        id={`review-comment-${orderId}-${productId}`}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        maxLength={5000}
        rows={3}
        placeholder="Share your experience with this product"
      />

      <button type="submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit review"}
      </button>

      {message && <p className="review-success" role="status">{message}</p>}
      {error && <p className="review-error" role="alert">{error}</p>}
    </form>
  );
}