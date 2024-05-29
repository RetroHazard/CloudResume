import React from "react";
import { useState } from "react";

const ContactForm = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const endpoint = 'https://api.cloudresume-agb.jp/dev/contact';

    const handleSubmit = (event) => {
        event.preventDefault();
        setIsLoading(true); // Set loading state to true
        const data = { firstName, lastName, email, subject, message };

        const fetchWithDelay = async () => {
            const startTime = Date.now();
            let responseStatus = 'success'; // Default to success, change to error if necessary

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    mode: 'cors',
                    cache: 'no-cache',
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    responseStatus = 'error';
                    throw new Error('Network response was not ok');
                }

                const responseData = await response.json();
                console.log(responseData); // handle response data
                // Clear form fields
                setFirstName('');
                setLastName('');
                setEmail('');
                setSubject('');
                setMessage('');
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
                responseStatus = 'error';
            } finally {
                const elapsedTime = Date.now() - startTime;
                const delay = Math.max(0, 5000 - elapsedTime);
                setTimeout(() => {
                    setIsLoading(false);
                    if (responseStatus === 'error') {
                        setStatus('Failed to send message.\nA notification has been sent to the Administrator for investigation.\nIf the issue persists, please try again later.');
                    } else {
                        setStatus('Message sent successfully!\nPlease allow me a short time to review your message.\nThank You!');
                    }
                }, delay);
            }
        };

        fetchWithDelay();
    };

    return (
        <form action={endpoint} onSubmit={handleSubmit} method="POST" className="space-y-8">
            <div className="flex flex-col">
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-content-subtitle">Name</label>
                <div className="flex flex-row gap-6">
                    <input type="text" id="firstName" className="text-entry" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    <input type="text" id="lastName" className="text-entry" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
            </div>
            <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-content-subtitle">Email</label>
                <input type="email" id="email" className="text-entry" placeholder="name@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
                <label htmlFor="subject" className="block mb-2 text-sm font-medium text-content-subtitle">Subject</label>
                <input type="text" id="subject" className="text-entry" placeholder="What's up?" value={subject} onChange={(e) => setSubject(e.target.value)} required />
            </div>
            <div className="sm:col-span-2">
                <label htmlFor="message" className="block mb-2 text-sm font-medium text-content-subtitle">Your Message</label>
                <textarea id="message" rows="5" className="text-entry" placeholder="Leave a comment..." value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
            </div>
            <button
                type="submit"
                className={
                    isLoading ? "bg-secondary-500 text-secondary-400 font-bold py-2 px-4 rounded inline-flex items-center w-40 cursor-not-allowed"
                        : "bg-primary-500 hover:bg-primary-400 text-secondary-800 font-bold py-2 px-4 rounded inline-flex items-center w-40"
                }
                disabled={isLoading}
            >
                <>
                    <div className="icon-box">
                        <i className="w-5 h-5 mr-2 text-content-icons">
                            <iconify-icon inline="" icon={isLoading ? "svg-spinners:270-ring-with-bg" : "fa6-solid:paper-plane"} />
                        </i>
                    </div>
                    <span className="text-content-header text-sm">{isLoading ? "Sending..." : "Send Message"}</span>
                </>
            </button>
            {status && <div className="mt-4 text-sm font-medium whitespace-pre">{status}</div>}
        </form>
    );
};

function Contact() {
    return (
        <>
            <div className="content-block" id="contact">
                <h2 className="h2 font-extrabold text-content-header mb-0">CONTACT ME</h2>
                <div className="mx-auto max-w-screen-md">
                    <p className="mb-6 font-sans text-content-accent sm:text-xl">
                        Questions? Comments? Have a potential opportunity or project that you'd like to collaborate on?
                        <br />
                        Feel free to reach out using the contact form below.
                    </p>
                    <ContactForm />
                </div>
            </div>
        </>
    );
}

export default Contact;
