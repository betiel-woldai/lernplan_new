import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, Send, X, ThumbsUp } from 'lucide-react';

interface LernplanFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  triggerAction: 'subject_created' | 'session_saved';
}

export default function LernplanFeedbackModal({
  isOpen,
  onClose,
  onSubmit,
  triggerAction
}: LernplanFeedbackModalProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setRating(null);
      setComment('');
      setIsAnonymous(true);
      setError(null);
      setShowSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    // Validation: at least one of rating or comment must be provided
    if (!rating && !comment.trim()) {
      setError('Bitte gib entweder eine Bewertung oder einen Kommentar ab.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Generate unique session ID based on timestamp and trigger action
      const sessionId = `${triggerAction}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const basePath = process.env.NODE_ENV === 'production' ? '/dias_test/lernplaner' : '';
      const response = await fetch(`${basePath}/api/feedback/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selfManagementSupport: rating,
          comment: comment.trim() || undefined,
          isAnonymous,
          triggerAction,
          sessionId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setError('Du hast heute bereits Feedback gegeben. Vielen Dank!');
        } else {
          setError(data.error || 'Fehler beim Speichern des Feedbacks');
        }
        setIsSubmitting(false);
        return;
      }

      // Success!
      setShowSuccess(true);

      // Auto-close after 2 seconds
      setTimeout(() => {
        onSubmit?.();
        onClose();
      }, 2000);

    } catch (err) {
      console.error('Feedback submission error:', err);
      setError('Netzwerkfehler. Bitte versuche es später erneut.');
      setIsSubmitting(false);
    }
  };

  const ratingLabels = [
    'Stimme überhaupt nicht zu',
    'Stimme nicht zu',
    'Neutral',
    'Stimme zu',
    'Stimme vollkommen zu'
  ];

  const modalContent = (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center p-4">
          {/* Modal */}
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full transform transition-all">
            {showSuccess ? (
              // Success State
              <div className="text-center py-8">
                <div className="mb-4 flex justify-center">
                  <ThumbsUp className="w-16 h-16 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Vielen Dank!
                </h2>
                <p className="text-gray-600">
                  Dein Feedback hilft uns, DIAS weiter zu verbessern.
                </p>
              </div>
            ) : (
              // Form State
              <>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <MessageCircle className="w-6 h-6 text-blue-600 mr-2" />
                    <h2 className="text-xl font-bold text-gray-900">Feedback zur Lernreflexion</h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Schließen"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Question */}
                <div className="mb-6">
                  <p className="text-gray-900 font-medium mb-4">
                    Bewerte deine Lernerfahrung:
                  </p>
                  <p className="text-gray-700 bg-blue-50 p-3 rounded-lg mb-4">
                    DIAS unterstützt mich beim Selbstmanagement.
                  </p>

                  {/* Likert Scale */}
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <label
                        key={value}
                        className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          rating === value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="rating"
                          value={value}
                          checked={rating === value}
                          onChange={() => setRating(value)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-gray-900">
                          {ratingLabels[value - 1]}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Comment Field */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dein Kommentar (optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Teile deine Gedanken darüber, wie DIAS dir beim Reflektieren deines Lernfortschritts hilft, weil..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 placeholder-gray-400"
                  />
                </div>

                {/* Anonymous Checkbox */}
                <div className="mb-6 bg-green-50 p-3 rounded-lg">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-4 h-4 text-green-600 focus:ring-green-500 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900 font-medium">
                      Anonym übermitteln
                    </span>
                  </label>
                  <p className="text-xs text-gray-600 mt-1 ml-6">
                    Wenn aktiviert, wird deine Identität nicht gespeichert.
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Wird gesendet...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Feedback senden
                      </>
                    )}
                  </button>
                  <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    Abbrechen
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );

  // Use portal to render modal at body level
  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
}
