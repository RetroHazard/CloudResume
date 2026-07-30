// website/src/components/cv_download_button.jsx
import { useState } from 'react';
import { useVisitorId } from '../utils/useVisitorId';
import { apiGet } from '../utils/apiClient';

// A button rather than an anchor: there is no longer a static URL to put in href. The CV
// sits behind CloudFront's trusted_key_groups, so the only working link is one minted per
// click by GET /download, and an <a href='#'> would announce as a link that goes nowhere.
function CvDownloadButton() {
    const [status, setStatus] = useState('idle');
    const visitorId = useVisitorId();

    const handleClick = async () => {
        if (status === 'issuing') return;
        setStatus('issuing');
        try {
            const data = await apiGet('/download', { visitorId });
            if (!data?.downloadUrl) throw new Error('No download URL in response');

            // A synthesised anchor rather than location.assign: navigating to a PDF makes
            // Chrome and Safari render it in place and the visitor loses the page. The
            // signed URL is same-origin with the site — which is the only condition the
            // spec places on honouring `download` — so this streams straight to disk
            // without buffering the file in JS memory the way fetch + Blob would.
            const link = document.createElement('a');
            link.href = data.downloadUrl;
            link.download = data.fileName || '';
            link.rel = 'noopener';
            document.body.appendChild(link);
            link.click();
            link.remove();

            setStatus('idle');
        } catch (err) {
            console.error('CV download failed:', err);
            setStatus('error');
        }
    };

    return (
        <div className='flex flex-col gap-1'>
            <button
                type='button'
                onClick={handleClick}
                disabled={status === 'issuing'}
                aria-busy={status === 'issuing'}
                className='ticket-button w-fit disabled:cursor-not-allowed disabled:opacity-60'
            >
                <iconify-icon icon='fa6-solid:ticket' aria-hidden='true' />
                {status === 'issuing' ? 'Issuing Ticket…' : 'Download CV — Ticket'}
            </button>
            {status === 'error' && (
                <p role='alert' className='font-mono text-xs text-content-accent'>
                    Ticket machine offline — please try again.
                </p>
            )}
        </div>
    );
}

export default CvDownloadButton;
