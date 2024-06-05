import React, { useRef, useEffect, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { v4 as uuidv4 } from 'uuid';

const ContactForm = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const captchaRef = useRef(null);
    const [uuid, setUuid] = useState('');

    useEffect(() => {
        // Check if a UUID is already stored in local storage
        let storedUuid = localStorage.getItem('uuid');
        if (!storedUuid) {
            // Generate a new UUID if none is found
            storedUuid = uuidv4();
            localStorage.setItem('uuid', storedUuid);
        }
        setUuid(storedUuid);
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const token = captchaRef.current.getValue();
        if (!token) {
            setStatus('Please complete the reCAPTCHA.');
            return;
        }
        setIsLoading(true); // Set loading state to true
        const data = { firstName, lastName, email, subject, message, token };

        const fetchWithDelay = async () => {
            const startTime = Date.now();
            let responseStatus = 'success'; // Default to success, change to error if necessary

            try {
                const response = await fetch(`https://api.cloudresume-agb.jp/v1/contact?uuid=${uuid}`, {
                    method: 'POST',
                    mode: 'cors',
                    cache: 'no-cache',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
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
                        setStatus(
                            'Failed to send message.\nA notification has been sent to the Administrator for investigation.\nIf the issue persists, please try again later.',
                        );
                    } else {
                        setStatus(
                            'Message sent successfully!\nPlease allow me a short time to review your message.\nThank You!',
                        );
                    }
                    captchaRef.current.reset();
                }, delay);
            }
        };

        fetchWithDelay();
    };

    return (
        <form onSubmit={handleSubmit} className='space-y-8'>
            <div className='flex flex-col'>
                <label htmlFor='name' className='mb-2 block text-sm font-medium text-content-subtitle'>
                    Name
                </label>
                <div className='flex flex-row gap-6'>
                    <input
                        type='text'
                        id='firstName'
                        className='text-entry'
                        placeholder='First Name'
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                    <input
                        type='text'
                        id='lastName'
                        className='text-entry'
                        placeholder='Last Name'
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                </div>
            </div>
            <div>
                <label htmlFor='email' className='mb-2 block text-sm font-medium text-content-subtitle'>
                    Email
                </label>
                <input
                    type='email'
                    id='email'
                    className='text-entry'
                    placeholder='name@email.com'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor='subject' className='mb-2 block text-sm font-medium text-content-subtitle'>
                    Subject
                </label>
                <input
                    type='text'
                    id='subject'
                    className='text-entry'
                    placeholder="What's up?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                />
            </div>
            <div className='sm:col-span-2'>
                <label htmlFor='message' className='mb-2 block text-sm font-medium text-content-subtitle'>
                    Your Message
                </label>
                <textarea
                    id='message'
                    rows='5'
                    className='text-entry'
                    placeholder='Leave a comment...'
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                ></textarea>
            </div>
            <div className='flex flex-col gap-y-3'>
                <ReCAPTCHA sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY} ref={captchaRef} />
                <button
                    type='submit'
                    className={
                        isLoading
                            ? 'inline-flex w-40 cursor-not-allowed items-center rounded bg-secondary-500 px-4 py-2 font-bold text-secondary-400'
                            : 'inline-flex w-40 items-center rounded bg-primary-500 px-4 py-2 font-bold text-secondary-800 hover:bg-primary-400'
                    }
                    disabled={isLoading}
                >
                    <>
                        <div className='icon-box'>
                            <i className='mr-2 h-5 w-5 text-content-icons'>
                                <iconify-icon
                                    inline=''
                                    icon={isLoading ? 'svg-spinners:270-ring-with-bg' : 'fa6-solid:paper-plane'}
                                />
                            </i>
                        </div>
                        <span className='text-sm text-content-header'>{isLoading ? 'Sending...' : 'Send Message'}</span>
                    </>
                </button>
            </div>
            {status && <div className='mt-4 whitespace-pre text-sm font-medium'>{status}</div>}
        </form>
    );
};

function Contact() {
    return (
        <>
            <div className='content-block' id='contact'>
                <h2 className='h2 mb-0 font-extrabold text-content-header'>CONTACT ME</h2>
                <div className='mx-auto max-w-screen-md'>
                    <p className='mb-6 font-sans text-content-accent sm:text-xl'>
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
