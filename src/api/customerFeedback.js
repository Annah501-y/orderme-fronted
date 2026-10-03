import api from "./axios";

/**
 * Submit a review for a product included in the buyer's order.
 * The backend checks order ownership, product membership, and duplicates.
 */
export async function submitProductReview({
    productId,
    orderId,
    rating,
    comment,
}) {
    const { data } = await api.post("/reviews", {
        product_id: productId,
        order_id: orderId,
        rating,
        comment: comment?.trim() || null,
    });

    return data;
}

/**
 * Load public, approved reviews for one product.
 * The returned value is a Laravel paginator with `data`, `current_page`,
 * and `last_page` fields.
 */
export async function getProductReviews(productId, page = 1) {
    const { data } = await api.get(
        `/products/${encodeURIComponent(productId)}/reviews`,
        { params: { page } }
    );

    return data.data;
}

/**
 * Submit general feedback or a comment attached to a FAQ.
 */
export async function submitFeedbackComment({
    type,
    faqId,
    faqQuestion,
    comment,
}) {
    const payload = {
        type,
        comment: comment.trim(),
    };

    if (type === "faq") {
        payload.faq_id = faqId;
        payload.faq_question = faqQuestion?.trim() || null;
    }

    const { data } = await api.post("/feedback/comments", payload);
    return data;
}

/**
 * Load public, approved comments for one FAQ.
 */
export async function getFaqComments(faqId, page = 1) {
    const { data } = await api.get(
        `/faqs/${encodeURIComponent(faqId)}/comments`,
        { params: { page } }
    );

    return data.data;
}

/**
 * Load submissions for the admin review queue.
 */
export async function getReviewsForModeration(page = 1) {
    const { data } = await api.get("/admin/reviews", {
        params: { page },
    });

    return data.data;
}

/**
 * Approve or reject a product review.
 */
export async function updateReviewStatus(reviewId, status) {
    const { data } = await api.patch(
        `/admin/reviews/${encodeURIComponent(reviewId)}`,
        { status }
    );

    return data;
}

/**
 * Load general and FAQ comments for the admin moderation queue.
 */
export async function getCommentsForModeration(page = 1) {
    const { data } = await api.get("/admin/feedback/comments", {
        params: { page },
    });

    return data.data;
}

/**
 * Approve or reject a comment and optionally include an admin response.
 */
export async function updateCommentStatus(
    commentId,
    status,
    adminResponse = ""
) {
    const { data } = await api.patch(
        `/admin/feedback/comments/${encodeURIComponent(commentId)}`,
        {
            status,
            admin_response: adminResponse.trim() || null,
        }
    );

    return data;
}