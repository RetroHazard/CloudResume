// website/src/pages/Contact/index.jsx
import { useRef, useEffect, useState, useReducer } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useVisitorId } from '../../utils/useVisitorId';
import { apiPost } from '../../utils/apiClient';
import { SectionShell, StatusPill } from '../../components/ui/primitives';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

// ── Form state ──────────────────────────────────────────────────────────────
const initialForm = { firstName: '', lastName: '', email: '', subject: '', message: '' };
function formReducer(state, { field, value }) {
    return { ...state, [field]: value };
}

// ── Submit hook ──────────────────────────────────────────────────────────────
function useContactSubmit(captchaRef) {
    const [formData, dispatch] = useReducer(formReducer, initialForm);
    const [status, setStatus] = useState({ type: null, text: '' }); // type: 'success' | 'error' | null
    const [isLoading, setIsLoading] = useState(false);
    const visitorId = useVisitorId();
    const timeoutRef = useRef(null);

    useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

    const setField = (field) => (e) => dispatch({ field, value: e.target.value });

    const handleSubmit = async (event) => {
        event.preventDefault();
        const token = RECAPTCHA_SITE_KEY ? captchaRef.current?.getValue() : null;
        if (RECAPTCHA_SITE_KEY && !token) {
            setStatus({ type: 'error', text: 'Please complete the reCAPTCHA.' });
            return;
        }
        setIsLoading(true);
        const startTime = Date.now();
        let resultType = 'success';

        try {
            const body = token ? { ...formData, token } : { ...formData };
            await apiPost(`/contact?uuid=${visitorId}`, body);
            dispatch({ field: 'firstName', value: '' });
            dispatch({ field: 'lastName', value: '' });
            dispatch({ field: 'email', value: '' });
            dispatch({ field: 'subject', value: '' });
            dispatch({ field: 'message', value: '' });
        } catch {
            resultType = 'error';
        } finally {
            const delay = Math.max(0, 5000 - (Date.now() - startTime));
            timeoutRef.current = setTimeout(() => {
                setIsLoading(false);
                if (resultType === 'error') {
                    setStatus({
                        type: 'error',
                        text: 'Failed to send message. A notification has been sent to the Administrator. If the issue persists, please try again later.',
                    });
                } else {
                    setStatus({
                        type: 'success',
                        text: 'Message sent successfully! Please allow me a short time to review your message. Thank You!',
                    });
                }
                if (captchaRef.current) captchaRef.current.reset();
            }, delay);
        }
    };

    return { formData, setField, status, isLoading, handleSubmit };
}

// ── Status alert ─────────────────────────────────────────────────────────────
function StatusAlert({ status }) {
    const baseClasses = 'mt-4 flex items-start gap-2 rounded-lg p-3 text-sm font-medium whitespace-pre-line';
    if (!status.type) {
        return <div role='status' aria-live='polite' className='sr-only' aria-atomic='true' />;
    }
    const isError = status.type === 'error';
    return (
        <div
            role={isError ? 'alert' : 'status'}
            aria-live={isError ? 'assertive' : 'polite'}
            aria-atomic='true'
            className={`${baseClasses} ${isError ? 'bg-red-900/30 text-red-300' : 'bg-green-900/30 text-green-300'}`}
        >
            <iconify-icon
                icon={isError ? 'fa6-solid:circle-xmark' : 'fa6-solid:circle-check'}
                aria-hidden='true'
                width='1.1em'
                height='1.1em'
            />
            <span>{status.text}</span>
        </div>
    );
}

// ── Form component ────────────────────────────────────────────────────────────
const ContactForm = () => {
    const captchaRef = useRef(null);
    const { formData, setField, status, isLoading, handleSubmit } = useContactSubmit(captchaRef);

    return (
        <form onSubmit={handleSubmit} className='space-y-4'>
            <fieldset>
                <legend className='mb-2 block text-sm font-medium text-content-subtitle'>Name</legend>
                {/* Side by side these two fields are ~76px wide on a phone, which
                    truncates both the placeholder and anything typed into them. */}
                <div className='flex flex-col gap-4 sm:flex-row sm:gap-6'>
                    <label htmlFor='firstName' className='sr-only'>First name</label>
                    <input
                        type='text'
                        id='firstName'
                        className='text-entry'
                        placeholder='First Name'
                        value={formData.firstName}
                        onChange={setField('firstName')}
                        required
                        aria-required='true'
                        maxLength={100}
                    />
                    <label htmlFor='lastName' className='sr-only'>Last name</label>
                    <input
                        type='text'
                        id='lastName'
                        className='text-entry'
                        placeholder='Last Name'
                        value={formData.lastName}
                        onChange={setField('lastName')}
                        required
                        aria-required='true'
                        maxLength={100}
                    />
                </div>
            </fieldset>
            <div>
                <label htmlFor='email' className='mb-2 block text-sm font-medium text-content-subtitle'>Email</label>
                <input
                    type='email'
                    id='email'
                    className='text-entry'
                    placeholder='name@email.com'
                    value={formData.email}
                    onChange={setField('email')}
                    required
                    aria-required='true'
                    maxLength={254}
                />
            </div>
            <div>
                <label htmlFor='subject' className='mb-2 block text-sm font-medium text-content-subtitle'>Subject</label>
                <input
                    type='text'
                    id='subject'
                    className='text-entry'
                    placeholder='e.g., Collaboration opportunity'
                    value={formData.subject}
                    onChange={setField('subject')}
                    required
                    aria-required='true'
                    maxLength={200}
                />
            </div>
            <div className='sm:col-span-2'>
                <label htmlFor='message' className='mb-2 block text-sm font-medium text-content-subtitle'>Your Message</label>
                <textarea
                    id='message'
                    rows='5'
                    className='text-entry'
                    placeholder='Describe your project, opportunity, or question...'
                    value={formData.message}
                    onChange={setField('message')}
                    required
                    aria-required='true'
                    minLength={10}
                    maxLength={5000}
                />
            </div>
            <div className='flex flex-col gap-y-3'>
                {RECAPTCHA_SITE_KEY && (
                    <ReCAPTCHA
                        sitekey={RECAPTCHA_SITE_KEY}
                        ref={captchaRef}
                        theme='dark'
                    />
                )}
                <button
                    type='submit'
                    disabled={isLoading}
                    aria-busy={isLoading}
                    aria-label={isLoading ? 'Sending message, please wait' : 'Send message'}
                    className={
                        isLoading
                            ? 'inline-flex w-48 cursor-not-allowed items-center justify-center gap-2 rounded border border-border bg-secondary-500 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-secondary-300 max-sm:min-h-11 max-sm:w-full'
                            : 'ticket-button w-48 max-sm:w-full'
                    }
                >
                    <iconify-icon
                        aria-hidden='true'
                        icon={isLoading ? 'svg-spinners:270-ring-with-bg' : 'fa6-solid:paper-plane'}
                    />
                    <span aria-hidden='true'>{isLoading ? 'Dispatching…' : 'Dispatch Message'}</span>
                </button>
            </div>
            <StatusAlert status={status} />
        </form>
    );
};

function Contact() {
    return (
        <>
            <title>Contact | Cloud Resume</title>
            <SectionShell
                id='contact'
                kicker='Station Office · Inquiry Counter'
                title='Contact'
                line={0}
                right={<StatusPill tone='on'>Open</StatusPill>}
            >
                <div className='mx-auto max-w-screen-md'>
                    <p className='mb-1 text-content-body sm:text-lg'>
                        Questions, comments, or a potential opportunity or project you'd like to collaborate on?
                    </p>
                    <p className='mb-6 font-mono text-xs uppercase tracking-wider text-content-accent'>
                        Leave a message at the counter — every inquiry is read.
                    </p>
                    <ContactForm />
                </div>
            </SectionShell>
        </>
    );
}

export default Contact;
