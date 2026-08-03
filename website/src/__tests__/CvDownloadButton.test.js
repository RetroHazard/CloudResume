import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CvDownloadButton from '../components/cv_download_button';
import { apiGet } from '../utils/apiClient';

vi.mock('../utils/apiClient', () => ({ apiGet: vi.fn() }));
vi.mock('../utils/useVisitorId', () => ({ useVisitorId: () => 'test-uuid' }));

// The CV is behind CloudFront's trusted_key_groups, so the only working link is the one
// this button fetches per click. Every assertion here guards a way that can silently
// break — a missing visitorId means the download goes uncounted, and a lost `download`
// attribute means the PDF opens in a viewer instead of saving.
describe('CvDownloadButton', () => {
    let clickSpy;

    beforeEach(() => {
        vi.clearAllMocks();
        clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const signed = {
        downloadUrl: '/files/cv.pdf?Expires=1&Signature=abc&Key-Pair-Id=K1',
        fileName: 'cv.pdf',
        expiresAt: 1,
        count: 7,
    };

    it('renders a button rather than a dead link', () => {
        render(<CvDownloadButton />);
        expect(screen.getByRole('button', { name: /download cv/i })).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /download cv/i })).not.toBeInTheDocument();
    });

    it('requests a signed URL for the current visitor', async () => {
        apiGet.mockResolvedValue(signed);
        render(<CvDownloadButton />);
        await userEvent.click(screen.getByRole('button', { name: /download cv/i }));
        await waitFor(() => expect(apiGet).toHaveBeenCalledWith('/download', { visitorId: 'test-uuid' }));
    });

    it('hands the signed URL to the browser with the download attribute intact', async () => {
        apiGet.mockResolvedValue(signed);
        render(<CvDownloadButton />);
        await userEvent.click(screen.getByRole('button', { name: /download cv/i }));

        await waitFor(() => expect(clickSpy).toHaveBeenCalledTimes(1));
        const anchor = clickSpy.mock.instances[0];
        expect(anchor.getAttribute('href')).toBe(signed.downloadUrl);
        expect(anchor.getAttribute('download')).toBe('cv.pdf');
    });

    it('surfaces an alert and downloads nothing when the endpoint fails', async () => {
        apiGet.mockRejectedValue(new Error('Service Unavailable'));
        render(<CvDownloadButton />);
        await userEvent.click(screen.getByRole('button', { name: /download cv/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent(/ticket machine offline/i);
        expect(clickSpy).not.toHaveBeenCalled();
    });

    it('treats a 200 with no URL as a failure rather than downloading nothing silently', async () => {
        apiGet.mockResolvedValue({ count: 7 });
        render(<CvDownloadButton />);
        await userEvent.click(screen.getByRole('button', { name: /download cv/i }));

        expect(await screen.findByRole('alert')).toBeInTheDocument();
        expect(clickSpy).not.toHaveBeenCalled();
    });

    it('disables itself while a request is in flight so a double click cannot double count', async () => {
        let release;
        apiGet.mockReturnValue(new Promise((resolve) => (release = resolve)));
        render(<CvDownloadButton />);
        const button = screen.getByRole('button', { name: /download cv/i });

        await userEvent.click(button);
        expect(button).toBeDisabled();
        expect(button).toHaveAttribute('aria-busy', 'true');
        expect(button).toHaveTextContent(/issuing ticket/i);

        release(signed);
        await waitFor(() => expect(button).not.toBeDisabled());
        expect(apiGet).toHaveBeenCalledTimes(1);
    });
});
