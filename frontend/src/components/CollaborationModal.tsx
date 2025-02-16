import React, { useState, useEffect } from 'react';
import emailjs from 'emailjs-com';

interface CollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
  investor: {
    name: string;
  };
}

const CollaborationModal: React.FC<CollaborationModalProps> = ({ isOpen, onClose, investor }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState<string>('');

  useEffect(() => {
    const initialTemplate = `
Dear ${investor.name},

I hope this message finds you well. I wanted to reach out regarding a potential collaboration with you on our project at SoloFounder.Ai.

Here are the details:

Product: Your Product Name
Timeline: Your Project Timeline

Message:
${message}

Looking forward to hearing your thoughts!

Best regards,
SoloFounder.Ai
    `;
    setEmailTemplate(initialTemplate);
  }, [investor.name, message]);

  const handleSendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const serviceID = 'service_o87a4tx';
    const templateID = 'template_steejhs';
    const userID = 'L2RX1rjQbdU3ZaaNj';

    const emailTemplateParams: Record<string, unknown> = {
      to_name: investor.name,
      from_name: 'SoloFounder.Ai',
      message: message,
      product: 'Your Product Name',
      timeline: 'Your Project Timeline',
      user_email: 'joshuadmello777@gmail.com'
    };

    emailjs.send(serviceID, templateID, emailTemplateParams, userID)
      .then(() => {
        alert('Email Sent Successfully!');
        setLoading(false);
        onClose();
      })
      .catch((error) => {
        console.error('Email sending error:', error);
        alert('Failed to send email, please try again later.');
        setLoading(false);
      });
  };

  return isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg shadow-2xl w-96 text-white">
        <h3 className="text-2xl font-bold mb-4">Collaborate with {investor.name}</h3>
        
        <form onSubmit={handleSendEmail} className="space-y-4">
          <div className="flex flex-col">
            <label className="text-lg font-medium mb-2">Email Template Preview:</label>
            <textarea
              className="p-3 border border-gray-700 rounded-md w-full bg-gray-800 text-white focus:ring-2 focus:ring-green-400"
              value={emailTemplate}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-300"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-green-400 to-teal-500 text-white rounded-md hover:from-green-500 hover:to-teal-600 transition duration-300"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;
};

export default CollaborationModal;
