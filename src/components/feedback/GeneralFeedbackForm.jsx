import React, { useState } from "react";
import { Link } from "react-router-dom";
import { submitFeedbackComment } from "../../api/customerFeedback";

/** Collect general feedback after an order has been completed. */
export default function GeneralFeedbackForm({ orderId }) {
    const [comment, setComment] = useState("");
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const isSignedIn = Boolean(localStorage.getItem("token"));

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage("");
        setError("");

        if (!isSignedIn) {
            setError("Please sign in before sending feedback.");
            return;
        }

        try {
            setSending(true);
            const result = await submitFeedbackComment({
                type: "general",
                comment: comment.trim(),
            });
            setMessage(result?.message || "Your feedback was submitted for review.");
            setComment("");
        } catch (requestError) {
            const validationErrors = requestError.response?.data?.errors;
            const firstValidationError = validationErrors
                ? Object.values(validationErrors).flat()[0]
                : null;
            setError(
                firstValidationError ||
                    requestError.response?.data?.message ||
                    "We could not send your feedback. Please try again."
            );
        } finally {
            setSending(false);
        }
    }

    return (
        <section className="buyer-order-feedback mt-4" aria-labelledby={`order-feedback-${orderId}`}>
            <h3 id={`order-feedback-${orderId}`}>Share your feedback</h3>
            <p className="text-muted">Your order is complete. Tell us how your OrderMe experience went.</p>
            {!isSignedIn && (
                <p>Please <Link to="/login">sign in</Link> to submit feedback.</p>
            )}
            <form onSubmit={handleSubmit}>
                <label className="form-label fw-semibold" htmlFor={`general-feedback-${orderId}`}>
                    Your feedback
                </label>
                <textarea
                    id={`general-feedback-${orderId}`}
                    className="form-control"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    maxLength={5000}
                    rows={4}
                    required
                    placeholder="Share your experience"
                />
                <div className="d-flex justify-content-between align-items-center gap-3 mt-3">
                    <small className="text-muted">{comment.length}/5000 characters</small>
                    <button
                        type="submit"
                        className="btn btn-dark"
                        disabled={!isSignedIn || sending || !comment.trim()}
                    >
                        {sending ? "Sending..." : "Send feedback"}
                    </button>
                </div>
                {message && <p className="text-success mt-3" role="status">{message}</p>}
                {error && <p className="text-danger mt-3" role="alert">{error}</p>}
            </form>
        </section>
    );
}
