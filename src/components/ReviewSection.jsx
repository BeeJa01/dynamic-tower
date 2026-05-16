'use client';

import { useState } from 'react';
import { useReviews } from '@/hooks/useReviews';
import StarRating from '@/components/StarRating';

const ReviewSection = ({ productId }) => {
  const {
    reviews,
    avgRating,
    reviewCount,
    hasPurchased,
    hasReviewed,
    addReview,
  } = useReviews(productId);

  const [rating, setRating]     = useState(0);
  const [name, setName]         = useState('');
  const [comment, setComment]   = useState('');
  const [error, setError]       = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0)    { setError('Please select a star rating.'); return; }
    if (!name.trim())    { setError('Please enter your name.'); return; }
    if (!comment.trim()) { setError('Please write a short review.'); return; }

    addReview({ name, rating, comment });
    setSubmitted(true);
    setRating(0);
    setName('');
    setComment('');
    setError('');
  };

  return (
    <div className="mt-10">
      <hr className="border-gray-200 dark:border-gray-700 mb-8" />

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Ratings & Reviews
        </h2>
        {avgRating && (
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {avgRating}
            </span>
            <div>
              <StarRating rating={Number(avgRating)} size="md" />
              <p className="text-xs text-gray-400 mt-0.5">
                {reviewCount} review{reviewCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Write a Review ── */}
      {hasPurchased && !submitted && (
        <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200
                        dark:border-orange-500/30 rounded-2xl p-5 mb-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">
            ✍️ Write a Review
          </h3>

          {/* Star picker */}
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest
                          text-gray-400 mb-2">
              Your Rating
            </p>
            <StarRating
              rating={rating}
              size="lg"
              interactive
              onRate={setRating}
            />
          </div>

          {/* Name */}
          <div className="mb-3">
            <label className="text-xs font-semibold uppercase tracking-widest
                               text-gray-400 mb-1.5 block">
              Your Name
            </label>
            <input
              type="text"
              placeholder="e.g. Adaeze O."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200
                         dark:border-gray-700 dark:bg-gray-900 dark:text-white
                         focus:outline-none focus:border-[#E87121] text-sm"
            />
          </div>

          {/* Comment */}
          <div className="mb-4">
            <label className="text-xs font-semibold uppercase tracking-widest
                               text-gray-400 mb-1.5 block">
              Your Review
            </label>
            <textarea
              placeholder="How was the food? Was it fresh and delivered on time?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200
                         dark:border-gray-700 dark:bg-gray-900 dark:text-white
                         focus:outline-none focus:border-[#E87121] text-sm resize-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs mb-3">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            className="bg-[#E87121] hover:bg-orange-600 text-white px-6 py-2.5
                       rounded-xl text-sm font-bold transition-all active:scale-95"
          >
            Submit Review
          </button>
        </div>
      )}

      {/* ── Submitted confirmation ── */}
      {submitted && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200
                        dark:border-green-500/30 rounded-2xl p-4 mb-6 text-center">
          <span className="text-2xl">🎉</span>
          <p className="text-green-600 dark:text-green-400 font-semibold text-sm mt-1">
            Thank you! Your review has been posted.
          </p>
        </div>
      )}

      {/* ── Not a verified buyer ── */}
      {!hasPurchased && (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200
                        dark:border-gray-700 rounded-2xl p-4 mb-6 text-center">
          <span className="text-2xl mb-2 block">🔒</span>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Only verified buyers can leave a review.
            <br />Order this item first to share your experience!
          </p>
        </div>
      )}

      {/* ── Already reviewed ── */}
      {hasPurchased && hasReviewed && !submitted && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200
                        dark:border-blue-500/30 rounded-2xl p-4 mb-6 text-center">
          <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
            ✅ You've already reviewed this product. Thank you!
          </p>
        </div>
      )}

      {/* ── Reviews List ── */}
      {reviews.length > 0 ? (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-gray-800 border border-gray-100
                         dark:border-gray-700 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900/30
                                  flex items-center justify-center text-[#E87121]
                                  font-bold text-sm shrink-0">
                    {review.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {review.name}
                      </p>
                      {review.verified && (
                        <span className="text-[10px] bg-green-100 dark:bg-green-900/30
                                         text-green-600 dark:text-green-400 px-2 py-0.5
                                         rounded-full font-medium">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                </div>
                <span className="text-xs text-gray-400">{review.date}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed ml-12">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <span className="text-4xl mb-3 block">💬</span>
          <p className="text-gray-400 text-sm">
            No reviews yet. Be the first to review this product!
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
