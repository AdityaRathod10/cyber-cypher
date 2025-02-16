// src/components/CollaborationModal.jsx
import React, { useState } from 'react';
import emailjs from 'emailjs-com';


// Modal component for collaboration form
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



const handleSendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    
    const serviceID = 'service_o87a4tx';
    const templateID = 'template_steejhs';
    const userID = 'L2RX1rjQbdU3ZaaNj';

    const emailTemplateParams: Record<string, unknown> = {
        to_name: investor.name,
        from_name: 'SoloFounder.Ai',  // Add your company name here
        message: message,
        product: 'Your Product Name',
        timeline: 'Your Project Timeline',
        user_email: 'joshuadmello777@gmail.com' // Your email here
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-96">
        <h3 className="text-2xl font-semibold mb-4">Collaborate with {investor.name}</h3>
        <form onSubmit={handleSendEmail} className="space-y-4">
          <div className="flex flex-col">
            <label className="text-lg">Your Message:</label>
            <textarea
              className="p-3 border border-gray-300 rounded-md w-full"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
            />
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded-md"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-green-400 to-teal-500 text-white rounded-md"
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
